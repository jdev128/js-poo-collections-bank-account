export default class Utils {

    static #CBU_PATTERN = /^\d{22}$/;

    static get CBU_PATTERN() {
        return Utils.#CBU_PATTERN;
    }

	static cbuIsValid(cbu) {
		/*
            Compuesta por 22 dígitos separados en dos bloques:
                Primer bloque:
                    - Número de entidad (3)
                    - Número de sucursal (4)
                    - Dígito verificador (1)
                Segundo bloque:
                    - Número de cuenta (13)
                    - Dígito verificador (1)
        */
		return Utils.CBU_PATTERN.test(cbu);
	}

    /**
     * Verify validity of a numeric value as a financial amount.
     * @param {number} amount Amount to test
     * @param {boolean} zeroValid If zero is a valid value. Default: false
     * @returns {boolean} True if number is a positive one. False otherwise.
     */
	static amountIsValid(amount, zeroValid = false) {
		const number = Number.parseFloat(amount);
        const isNumber = !Number.isNaN(number);
        const isOnRange = zeroValid ? number >= 0 : number > 0;
		return isNumber && isOnRange;
	}

	static financialFormat(number = 0) {
		return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS"
        }).format(number);
	}

    static dateTimeFormat(date = new Date()) {
        return new Intl.DateTimeFormat("es-AR", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(date).replace(",", "");
    }
}
