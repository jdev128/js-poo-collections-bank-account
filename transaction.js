import Utils from "./utils.js";

export class Transfer {
	static #NULL_ACCOUNT = "".padStart(22, "0");

	#origin = String();
	#destination = String();
	#amount = Number();
	#date = new Date();

	get origin() {
		return this.#origin;
	}

	get destination() {
		return this.#destination;
	}

	get amount() {
		return this.#amount;
	}

	get date() {
		return this.#date;
	}

	static get NULL_ACCOUNT() {
		return Transfer.#NULL_ACCOUNT;
	}

	constructor(origin, destination, amount) {
		if (!Utils.amountIsValid(amount)) {
			throw new TypeError("Invalid amount");
		}
		if (!Utils.cbuIsValid(origin)) {
			throw new TypeError("Origin account has an invalid format");
		}
		if (!Utils.cbuIsValid(destination)) {
			throw new TypeError("Destination account has an invalid format");
		}

		this.#origin = origin;
		this.#destination = destination;
		this.#amount = amount;
		this.#date = new Date();
	}
}

export class Extraction extends Transfer {
	constructor(origin, amount) {
		super(origin, Transfer.NULL_ACCOUNT, amount);
	}
}

export class Deposit extends Transfer {
	constructor(destination, amount) {
		super(Transfer.NULL_ACCOUNT, destination, amount);
	}
}