import assert from "node:assert/strict";
import { suite, test, beforeEach } from "node:test";

import { network } from "hardhat";
import { assertCurrentChain } from "viem";

suite("Homework", async function() {

    let Homework: any;

    beforeEach(async function () {
        const { viem } = await network.connect();
        Homework = await viem.deployContract("Homework");
    });

    test("Should initialize with totalSum = 0", async function () {
            const initialTotalSum = await Homework.read.totalSum();
            assert.equal(initialTotalSum, 0n);
    });

    test("Should correctly sum numbers [1, 2, 3]", async function () {
        await Homework.write.addNumbers([ [1,2,3] ]);
        const currentTotalSum = await Homework.read.totalSum();
        assert.equal(currentTotalSum, 6n);
    });

    test("Should handle empty array", async function () {
        await Homework.write.addNumbers([ [] ]);
        const currentTotalSum = await Homework.read.totalSum();
        assert.equal(currentTotalSum, 0n);
    });

    test("Should handle multiple calls", async function () {
        await Homework.write.addNumbers([ [1,2] ]);
        await Homework.write.addNumbers([ [3,4] ]);
        const currentTotalSum = await Homework.read.totalSum();
        assert.equal(currentTotalSum, 10n);
    });
});