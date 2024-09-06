import Utils from "./utils.js";

export class Account {
	static #EMPTY_ACCOUNT_CBU = "0000000000000000000000";

	#cbu = String();
	#balance = Number();
	#overdraft = Number();

	constructor(cbu, overdraft = 0) {
		if (!Utils.cbuIsValid(cbu)) {
			throw new TypeError("Invalid CBU");
		} else if (!Utils.amountIsValid(overdraft, true)) {
			throw new TypeError("Invalid overdraft");
		}
		this.#cbu = cbu;
		this.#overdraft = overdraft;
	}

	get cbu() {
		return this.#cbu;
	}

	get balance() {
		return this.#balance;
	}

	get overdraft() {
		return this.#overdraft;
	}

	static get EMPTY_ACCOUNT_CBU() {
		return Account.#EMPTY_ACCOUNT_CBU;
	}

	deposit(amount) {
		if (!Utils.amountIsValid(amount)) {
			throw new Error("Invalid amount");
		}
		this.#balance += Number.parseFloat(amount);
		return this.#balance;
	}

	extract(amount) {
		if (
			!Utils.amountIsValid(amount) ||
			Number.parseFloat(amount) > this.#balance + this.#overdraft
		) {
			throw new Error(
				"Amount should be positive and less or equal to balance plus overdraft"
			);
		}
		this.#balance -= Number.parseFloat(amount);
		return this.#balance;
	}
}

export class SavingAccount extends Account {
	constructor(cbu) {
		super(cbu, 0);
	}
}
