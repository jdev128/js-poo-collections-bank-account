import Utils from "./utils.js";

export default class Agenda {
	#cbus;

	get length() {
		return this.#cbus.size;
	}

	constructor() {
		this.#cbus = new Set(["TYPE_PLACEHOLDER"]);
		this.#cbus.delete("TYPE_PLACEHOLDER");
	}

	has(cbu) {
		return this.#cbus.has(cbu.trim());
	}

	/**
	 * Add a cbu to the end of the list.
	 * @param {string} cbu CBU to add
	 * @returns A boolean value informing if the cbu could be added or not
	 * @throws A TypeError if cbu don't have a valid format.
	 */
	add(cbu) {
		const TRIMMED_CBU = cbu.trim();
		if (!Utils.cbuIsValid(TRIMMED_CBU)) {
			throw new TypeError("Invalid CBU");
		}
		if (this.has(TRIMMED_CBU)) {
			return false;
		}
		this.#cbus.add(TRIMMED_CBU);
		return true;
	}

	remove(cbu) {
		return this.#cbus.delete(cbu.trim());
	}

	/**
	 * Filter the list of cbus and return it ordered by insertion order
	 * @param {RegExp} pattern Pattern to filter the cbus returned
	 * @returns An array containing the cbus that match the pattern
	 */
	get(pattern = Utils.CBU_PATTERN) {
		return [...this.#cbus].filter((cbu) => pattern.test(cbu));
	}
}
