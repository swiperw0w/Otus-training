import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";

describe("TrustlessMarketplace", async () => {

  let viem;
  let publicClient;
  let walletClients;
  let owner, client, freelancer;
  let marketplace;

  beforeEach(async () => {
    const connection = await network.connect();
    viem = connection.viem;

    publicClient = await viem.getPublicClient();
    walletClients = await viem.getWalletClients();

    [owner, client, freelancer] = walletClients;

    marketplace = await viem.deployContract("TrustlessMarketplace");
  });

  it("Should create a new order correctly", async () => {

    // Вызываем createOrder от имени клиента
    await marketplace.write.createOrder(
        ["Build website", 10n ** 18n],
        { account: client.account }
    );

    // Читаем заказ из контракта
    const order = await marketplace.read.orders([1n]);

    // Проверяем client
    assert.equal(
      order[0].toLowerCase(),
      client.account.address.toLowerCase()
    );

    // Проверяем freelancer (должен быть нулевым адресом)
    assert.equal(order[1], "0x0000000000000000000000000000000000000000");

    // Проверяем description
    assert.equal(order[2], "Build website");

    // Проверяем amount
    assert.equal(order[3], 10n ** 18n);

    // Проверяем статус (Open = 0)
    assert.equal(order[4], 0);
  });

  it("Should allow freelancer to accept an open order", async () => {

    // Создаём заказ
    await marketplace.write.createOrder(
        ["Build website", 10n ** 18n],
        { account: client.account }
    );

    // Принимаем заказ
    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );

    // Читаем заказ
    const order = await marketplace.read.orders([1n]);

    // Проверяем freelancer
    assert.equal(
      order[1].toLowerCase(),
      freelancer.account.address.toLowerCase()
    );

    // Проверяем статус
    assert.equal(order[4], 1) // Accepted
  });

  it("Should revert if client tries to accept their own oder", async () => {

    // Клиент создает заказ
    await marketplace.write.createOrder(
      ["Task", 10n ** 18n],
      { account: client.account }
    );

    // Клиент пытается принять свой заказ
    try {
      await marketplace.write.acceptOrder(
        [1n],
        { account: client.account }
      );

      assert.fail("Expected transaction to revert");

    } catch (error) {
      assert.ok(error.message.includes("ClientCannotAcceptOwnOrder"));
    }
  });

  it("Should allow client to fund an accepted order", async () => {
    
    // Создаём заказ
    await marketplace.write.createOrder(
        ["Task", 10n ** 18n],
        { account: client.account }
    );

    //Фрилансер принимает заказ
    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );

    // Клиент вносит депозит
    await marketplace.write.fundOrder(
      [1n],
      { account: client.account, value: 10n ** 18n }
    );

    // Проверяем статус
    const order = await marketplace.read.orders([1n]);

    assert.equal(order[4], 2) // Funded
  });

  it("Should revert if funding amount is incorrect", async () => {

    // Создаём заказ
    await marketplace.write.createOrder(
        ["Task", 10n ** 18n],
        { account: client.account }
    );

    // Фрилансер принимает заказ
    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );

    // Клиент пытается внести меньше ETH
    try {
      await marketplace.write.fundOrder(
        [1n],
        { account: client.account, value: 5n * 10n ** 17n } // 0.5 ETH вместо 1 ETH
      );

      assert.fail("Expected transaction to revert");

    } catch (error) {
      assert.ok(error.message.includes("IncorrectAmount"));
    }
  });

  it("Should complete order, transfer payout and accumulate fee", async () => {

    const oneEther = 10n ** 18n;

    // Создаём заказ
    await marketplace.write.createOrder(
        ["Task", oneEther],
        { account: client.account }
    );

    // Принимаем заказ 
    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );
    
    // Вносим депозит
    await marketplace.write.fundOrder(
      [1n],
      { account: client.account, value: oneEther }
    );

    // Сохраняем баланс фрилансера до выплаты
    const balanceBefore = await publicClient.getBalance({
      address: freelancer.account.address
    });

    // Подтверждаем выполнение заказа
    await marketplace.write.confirmCompletion(
      [1n],
      { account: client.account }
    );

    // Проверяем статус заказа
    const order = await marketplace.read.orders([1n]);

    assert.equal(order[4], 3) // Completed

    // Проверяем начисление комиссии
    const accumulatedFee = await marketplace.read.accumulatedFees();
    assert.equal(accumulatedFee, oneEther / 100n); // 1% от 1 ETH

    // Проверяем, что фрилансер получил payout
    const balanceAfter = await publicClient.getBalance({
      address: freelancer.account.address
    });

    assert.ok(balanceAfter > balanceBefore); 
  });

  it("Should allow owner to withdraw accumulated fees", async () => {

    const oneEther = 10n ** 18n;

    // Создаём заказ и проводим полный цикл
    await marketplace.write.createOrder(
        ["Task", oneEther],
        { account: client.account }
    );

    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );

    await marketplace.write.fundOrder(
      [1n],
      { account: client.account, value: oneEther }
    );

    await marketplace.write.confirmCompletion(
      [1n],
      { account: client.account }
    );

    // Проверяем, что комиссия накопилась
    const feesBefore = await marketplace.read.accumulatedFees();
    assert.equal(feesBefore, oneEther / 100n); // 1%

    // Баланс owner до вывода
    const ownerBalanceBefore = await publicClient.getBalance({
      address: owner.account.address
    });

    // Вывод комиссии
    await marketplace.write.withdrawFees(
      { account: owner.account }
    );

    // Проверяем, что accumulatedFees обнулился
    const feesAfter = await marketplace.read.accumulatedFees();
    assert.equal(feesAfter, 0n);

    // Проверяем, что баланс owner вырос
    const ownerBalanceAfter = await publicClient.getBalance({
      address: owner.account.address
    });

    assert.ok(ownerBalanceAfter > ownerBalanceBefore);
  });

  it("Should revert if non-owner tries to withdraw fees", async () => {

    try {
      await marketplace.write.withdrawFees(
        { account: client.account }
      );

      assert.fail("Expected transaction to revert");

    } catch (error) {
      assert.ok(error.message.includes("OwnableUnauthorizedAccount")); // Ошибка из OZ
    }
  });

  // Все сценарии cancelOrder
  it("Client should cancel an open order", async () => {

    await marketplace.write.createOrder(
        ["Task", 10n ** 18n],
        { account: client.account }
    );

    await marketplace.write.cancelOrder(
      [1n],
      { account: client.account }
    );

    const order = await marketplace.read.orders([1n]);
    assert.equal(order[4], 4) // Cancelled
  });

  it("Freelancer should be able to cancel accepted order and reset to Open", async () => {

    await marketplace.write.createOrder(
        ["Task", 10n ** 18n],
        { account: client.account }
    );

    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );

    await marketplace.write.cancelOrder(
      [1n],
      { account: freelancer.account }
    );

    const order = await marketplace.read.orders([1n]);
    assert.equal(order[4], 0) // Open
    assert.equal(
      order[1].toLowerCase(),
      "0x0000000000000000000000000000000000000000"
    );
  });

  it("Client should receive refund when cancelling a funded order", async () => {

    const oneEther = 10n ** 18n;

    await marketplace.write.createOrder(
        ["Task", oneEther],
        { account: client.account }
    );

    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );

    await marketplace.write.fundOrder(
      [1n],
      { account: client.account, value: oneEther }
    );

    const balanceBefore = await publicClient.getBalance({
      address: client.account.address
    });

    await marketplace.write.cancelOrder(
      [1n],
      { account: client.account }
    );

    const balanceAfter = await publicClient.getBalance({
      address: client.account.address
    });

    assert.ok(balanceAfter > balanceBefore);
  });

  it("Should revert if trying to cancel completed order", async () => {

    const oneEther = 10n ** 18n;

    await marketplace.write.createOrder(
        ["Task", oneEther],
        { account: client.account }
    );

    await marketplace.write.acceptOrder(
      [1n],
      { account: freelancer.account }
    );

    await marketplace.write.fundOrder(
      [1n],
      { account: client.account, value: oneEther }
    );

    await marketplace.write.confirmCompletion(
      [1n],
      { account: client.account }
    );

    try {
      await marketplace.write.cancelOrder(
        [1n],
        { account: client.account }
      );

      assert.fail("Expected revert");

    } catch (error) {
      assert.ok(error.message.includes("CannotCancel"));
    }
  });

});
