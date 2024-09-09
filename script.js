import { Account, SavingAccount } from "./account.js";
import Agenda from "./agenda.js";
import { Transfer, Deposit, Extraction } from "./transaction.js";
import Interface from "./interface.js";
import Utils from "./utils.js";

/*
	OK CuentaBancaria|CajaAhorro|CuentaCorriente (POO, ENCAPSULAMIENTO, HERENCIA)
		(saldo, sobregiro, depositar, extraer)

    OK Agenda de CBUs (CONJUNTOS / VALIDACION DE FORMATO / ARREGLO DESDE SET / AGREGAR / ELIMINAR)

	OK Filtrado de CBUs (REGEX)

    OK Creacion / Listado de Transacciones
		(monto, fecha, hora, cbuOrigen, cbuDestino)
*/

/* FIXED BUGS
	- Safari iOS: Don't hide secondary account on change (OK - disabled attribute)
	- iOS & Android: Don't show title attributes (OK - ::before property)
	- Firefox Android: Don't show validation messages (OK - form.invalid :invalid)
*/

const EXTRACTION_TAG = "Extracción";
const DEPOSIT_TAG = "Depósito";
const TRANSFER_TAG = "Transferencia";

const MODEL = {
	accounts: {
		basicAccount: new Account("2344896788934928283922", 15000),
		savingAccount: new SavingAccount("2344896788939928283938"),
	},
	/**
	 * Obtains the account that matches with a cbu
	 * @param {string} cbu The cbu to search by
	 * @returns {Account} The account or undefined if not found.
	 */
	getAccount: function (cbu) {
		return Object.values(this.accounts).find(
			(account) => account.cbu === cbu
		);
	},
	cbuBook: new Agenda(),
	transactions: [],
};

MODEL.cbuBook.add("2300096788934928283922");

createDeposit(MODEL.accounts.basicAccount.cbu, 42300);

createTransfer(
	MODEL.accounts.basicAccount.cbu,
	MODEL.accounts.savingAccount.cbu,
	10000.40
);

createExtraction(MODEL.accounts.basicAccount.cbu, 40000);

function createCBU(cbu) {
	if (MODEL.getAccount(cbu)) {
		Interface.showDialog(
			"El cbu pertenece a una de tus cuentas, ingresa otro e intenta nuevamente."
		);
		return false;
	}
	try {
		let added = MODEL.cbuBook.add(cbu);
		if (!added) {
			Interface.showDialog("El cbu ya se encuentra en el listado");
		}
		return added;
	} catch (error) {
		if (error instanceof TypeError) {
			Interface.showDialog(
				"Ingresa un cbu válido de 22 digitos e intenta nuevamente"
			);
		}
		return false;
	}
}

function deleteCBU(cbu) {
	let result = MODEL.cbuBook.remove(cbu);
	console.log(JSON.stringify(MODEL.cbuBook.get()));
	return result;
}

function createDeposit(cbu, amount) {
	const account = MODEL.getAccount(cbu);

	if (!account) {
		Interface.showDialog(
			"Cuenta inválida. Selecciona otra e intenta nuevamente."
		);
		return;
	}

	if (!Utils.amountIsValid(amount)) {
		Interface.showDialog(
			"Monto inválido. Ingresa uno mayor a cero e intenta nuevamente."
		);
		return;
	}

	const NEW_BALANCE = account.deposit(amount);
	const NEW_DEPOSIT = new Deposit(cbu, amount);

	MODEL.transactions.push(NEW_DEPOSIT);
	if (account instanceof SavingAccount) {
		Interface.updateSavingAccountInfo(NEW_BALANCE);
	} else {
		Interface.updateBasicAccountInfo(NEW_BALANCE);
	}

	return {
		date: NEW_DEPOSIT.date,
		type: DEPOSIT_TAG,
		origin: NEW_DEPOSIT.origin,
		destination: NEW_DEPOSIT.destination,
		amount: NEW_DEPOSIT.amount,
	};
}

function createExtraction(cbu, amount) {
	const account = MODEL.getAccount(cbu);

	if (!account) {
		Interface.showDialog(
			"Cuenta inválida. Selecciona otra e intenta nuevamente."
		);
		return;
	}

	if (!Utils.amountIsValid(amount)) {
		Interface.showDialog(
			"Monto inválido. Ingresa uno mayor a cero e intenta nuevamente."
		);
		return;
	}

	try {
		const NEW_BALANCE = account.extract(amount);
		const NEW_EXTRACTION = new Extraction(cbu, amount);

		MODEL.transactions.push(NEW_EXTRACTION);
		if (account instanceof SavingAccount) {
			Interface.updateSavingAccountInfo(NEW_BALANCE);
		} else {
			Interface.updateBasicAccountInfo(NEW_BALANCE);
		}

		return {
			date: NEW_EXTRACTION.date,
			type: EXTRACTION_TAG,
			origin: NEW_EXTRACTION.origin,
			destination: NEW_EXTRACTION.destination,
			amount: NEW_EXTRACTION.amount,
		};
	} catch (error) {
		Interface.showDialog(
			"El monto ingresado supera el saldo disponible en la cuenta." +
				"\nIngresa un monto menor e intenta nuevamente."
		);
		return;
	}
}

function createTransfer(origin, destination, amount) {
	const originAccount = MODEL.getAccount(origin);

	if (!originAccount) {
		Interface.showDialog(
			"Cuenta inválida. Selecciona otra e intenta nuevamente."
		);
		return;
	}

	if (!Utils.amountIsValid(amount)) {
		Interface.showDialog(
			"Monto inválido. Ingresa uno mayor a cero e intenta nuevamente."
		);
		return;
	}

	if (!Utils.cbuIsValid(destination)) {
		Interface.showDialog(
			"El cbu de destino es inválido. Ingresa uno de 22 digitos e intenta nuevamente."
		);
		return;
	}

	let destinationAccount = MODEL.getAccount(destination);

	if (!MODEL.cbuBook.has(destination) && !destinationAccount) {
		Interface.showDialog(
			"El cbu de destino no se encuentra en la agenda y no corresponde a ninguna de tus cuentas. Regístrala e intenta nuevamente"
		);
		return;
	}

	try {
		const NEW_ORIGIN_BALANCE = originAccount.extract(amount);

		if (originAccount instanceof SavingAccount) {
			Interface.updateSavingAccountInfo(NEW_ORIGIN_BALANCE);
		} else {
			Interface.updateBasicAccountInfo(NEW_ORIGIN_BALANCE);
		}

		if (destinationAccount) {
			const NEW_DEST_BALANCE = destinationAccount.deposit(amount);
			if (destinationAccount instanceof SavingAccount) {
				Interface.updateSavingAccountInfo(NEW_DEST_BALANCE);
			} else {
				Interface.updateBasicAccountInfo(NEW_DEST_BALANCE);
			}
		}

		const NEW_TRANSFER = new Transfer(origin, destination, amount);
		MODEL.transactions.push(NEW_TRANSFER);

		return {
			date: NEW_TRANSFER.date,
			type: TRANSFER_TAG,
			origin: NEW_TRANSFER.origin,
			destination: NEW_TRANSFER.destination,
			amount: NEW_TRANSFER.amount,
		};
	} catch (error) {
		Interface.showDialog(
			"El monto ingresado supera el saldo disponible en la cuenta." +
				"\nIngresa un monto menor e intenta nuevamente."
		);
		return;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	Interface.initHandlers(
		createCBU,
		deleteCBU,
		createDeposit,
		createExtraction,
		createTransfer
	);

	Interface.updateSavingAccountInfo(
		MODEL.accounts.savingAccount.balance,
		MODEL.accounts.savingAccount.cbu
	);

	Interface.updateBasicAccountInfo(
		MODEL.accounts.basicAccount.balance,
		MODEL.accounts.basicAccount.cbu,
		MODEL.accounts.basicAccount.overdraft
	);

	MODEL.cbuBook.get().forEach((cbu) => {
		Interface.bookCBU(cbu);
	});

	MODEL.transactions.forEach((transaction) => {
		let transactionType;
		if (transaction instanceof Extraction) {
			transactionType = EXTRACTION_TAG;
		} else if (transaction instanceof Deposit) {
			transactionType = DEPOSIT_TAG;
		} else {
			transactionType = TRANSFER_TAG;
		}
		Interface.addToHistory(
			transaction.date,
			transactionType,
			transaction.origin,
			transaction.destination,
			transaction.amount
		);
	});
});
