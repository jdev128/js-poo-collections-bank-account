import Utils from "./utils.js";

const SAVING_ACCOUNT_CARD = document.getElementById("saving-account");
const BASIC_ACCOUNT_CARD = document.getElementById("basic-account");

const MODAL_BACKDROP = document.getElementById("modal-backdrop");

const TRANSACTION_MODAL_TITLE = document.querySelector(
	"#transaction-creator .modal-header p"
);
const TRANSACTION_CREATE_BUTTON = document.querySelector(
	"#transaction-creator button.primary"
);

const TRANSACTION_MODAL_FORM = document.forms["transaction-data"];

const PRIMARY_ACCOUNT = document.querySelector(
	"#transaction-creator select#primary-account"
);
const PRIMARY_ACCOUNT_LABEL = document.querySelector(
	"#transaction-creator label[for='primary-account']"
);

const SECONDARY_ACCOUNT = document.querySelector(
	"#transaction-creator select#secondary-account"
);
const SECONDARY_ACCOUNT_LABEL = document.querySelector(
	"#transaction-creator label[for='secondary-account']"
);

const AMOUNT_INPUT = document.querySelector(
	"#transaction-creator input#amount"
);

const CBU_INPUT = document.getElementById("cbu-input");
const CBU_SEARCH_BUTTON = document.getElementById("search-cbu");
const CBU_LIST = document.querySelector("#cbu-list tbody");

const NO_CBU_MESSAGE = "Aún no registraste ningún CBU";
const NO_CBU_MESSAGE_ID = "empty-agenda-message";

const NO_CBU_MATCH_MESSAGE =
	"Ninguno de los CBUs coincide con el patrón ingresado";
const NO_CBU_MATCH_MESSAGE_ID = "empty-filter-message";

const HISTORY = document.querySelector("#history tbody");

const NO_TRANSACTIONS_MESSAGE =
	"Las transacciones que realices irán apareciendo aquí.";
const NO_TRANSACTIONS_MESSAGE_ID = "empty-history-message";

const DEFAULT_CBU_ADD_DELETE_HANDLER = (cbu) => true;
let cbuDeletionHandler = DEFAULT_CBU_ADD_DELETE_HANDLER;

const DEFAULT_DEPOSIT_EXTRACTION_SUBMIT_HANDLER = (cbu, amount) => {
	return {
		date: new Date(),
		type: "-",
		origin: "-",
		destination: "-",
		amount: 0,
	};
};
let depositSubmitHandler = DEFAULT_DEPOSIT_EXTRACTION_SUBMIT_HANDLER;
let extractionSubmitHandler = DEFAULT_DEPOSIT_EXTRACTION_SUBMIT_HANDLER;

const DEFAULT_TRANSFER_SUBMIT_HANDLER = (origin, destination, amount) => {
	return {
		date: new Date(),
		type: "-",
		origin: "-",
		destination: "-",
		amount: 0,
	};
};
let transferSubmitHandler = DEFAULT_TRANSFER_SUBMIT_HANDLER;

/**
 * Updates the saving account card with new info
 * @param {number} balance Current balance
 * @param {string} cbu CBU - Optional (should be defined at least once)
 */
function updateSavingAccountInfo(balance, cbu = undefined) {
	SAVING_ACCOUNT_CARD.querySelector("span.current-balance").textContent =
		Utils.financialFormat(balance);
	if (cbu) {
		SAVING_ACCOUNT_CARD.querySelector("span.cbu-number").textContent = cbu;
		addPrimaryAccountOption(cbu, "CA");
		addSecondaryAccountOption(cbu, "CA");
	}
}

/**
 * Updates the basic account card with new info
 * @param {number} balance Current balance
 * @param {string} cbu CBU - Optional (should be defined at least once)
 * @param {number} overdraft Overdraft - Optional (should be defined at least once)
 */
function updateBasicAccountInfo(
	balance,
	cbu = undefined,
	overdraft = undefined
) {
	BASIC_ACCOUNT_CARD.querySelector("span.current-balance").textContent =
		Utils.financialFormat(balance);
	if (cbu) {
		BASIC_ACCOUNT_CARD.querySelector("span.cbu-number").textContent = cbu;
		addPrimaryAccountOption(cbu, "CC");
		addSecondaryAccountOption(cbu, "CC");
	}
	if (overdraft) {
		BASIC_ACCOUNT_CARD.querySelector("span.account-overdraft").textContent =
			Utils.financialFormat(overdraft);
	}
}

function resetSecondaryAccountSelector() {
	SECONDARY_ACCOUNT.querySelector("option[hidden]")?.toggleAttribute(
		"hidden"
	);
	SECONDARY_ACCOUNT.querySelector("option[disabled]")?.toggleAttribute(
		"disabled"
	);
}

function primaryAccountSelectionHandler(event) {
	const NEW_VALUE = event.target.value;

	resetSecondaryAccountSelector();

	if (NEW_VALUE !== "") {
		SECONDARY_ACCOUNT.querySelector(
			`option[value='${NEW_VALUE}']`
		)?.toggleAttribute("hidden");
		SECONDARY_ACCOUNT.querySelector(
			`option[value='${NEW_VALUE}']`
		)?.toggleAttribute("disabled");

		if (SECONDARY_ACCOUNT.value === NEW_VALUE) {
			SECONDARY_ACCOUNT.value = "";
		}
	}
}

/**
 * Updates transactions modal content according to the action
 * selected by user.
 * @param {string} actionID The id of button clicked by the user
 */
function updateTransactionCreator(actionID) {
	switch (actionID) {
		case "deposit-button":
			TRANSACTION_MODAL_TITLE.innerHTML = "Nuevo deposito";
			TRANSACTION_CREATE_BUTTON.innerHTML = "Depositar";
			TRANSACTION_MODAL_FORM.onsubmit = (event) => {
				let result = depositSubmitHandler(
					PRIMARY_ACCOUNT.value,
					AMOUNT_INPUT.value
				);
				if (result) {
					addToHistory(...Object.values(result));
					TRANSACTION_MODAL_FORM.reset();
					closeModal(event);
				}
			};

			PRIMARY_ACCOUNT_LABEL.textContent = "Cuenta de Destino";
			PRIMARY_ACCOUNT.removeEventListener(
				"change",
				primaryAccountSelectionHandler
			);

			SECONDARY_ACCOUNT_LABEL.style.display = "none";
			SECONDARY_ACCOUNT.style.display = "none";
			SECONDARY_ACCOUNT.removeAttribute("required");

			break;
		case "withdraw-button":
			TRANSACTION_MODAL_TITLE.innerHTML = "Nueva extraccion";
			TRANSACTION_CREATE_BUTTON.innerHTML = "Extraer";
			TRANSACTION_MODAL_FORM.onsubmit = (event) => {
				let result = extractionSubmitHandler(
					PRIMARY_ACCOUNT.value,
					AMOUNT_INPUT.value
				);
				if (result) {
					addToHistory(...Object.values(result));
					TRANSACTION_MODAL_FORM.reset();
					closeModal(event);
				}
			};

			PRIMARY_ACCOUNT_LABEL.textContent = "Cuenta de Origen";
			PRIMARY_ACCOUNT.removeEventListener(
				"change",
				primaryAccountSelectionHandler
			);

			SECONDARY_ACCOUNT_LABEL.style.display = "none";
			SECONDARY_ACCOUNT.style.display = "none";
			SECONDARY_ACCOUNT.removeAttribute("required");

			break;
		case "transfer-button":
			TRANSACTION_MODAL_TITLE.innerHTML = "Nueva transferencia";
			TRANSACTION_CREATE_BUTTON.innerHTML = "Transferir";
			TRANSACTION_MODAL_FORM.onsubmit = (event) => {
				let result = transferSubmitHandler(
					PRIMARY_ACCOUNT.value,
					SECONDARY_ACCOUNT.value,
					AMOUNT_INPUT.value
				);
				if (result) {
					addToHistory(...Object.values(result));
					TRANSACTION_MODAL_FORM.reset();
					closeModal(event);
				}
			};

			PRIMARY_ACCOUNT_LABEL.textContent = "Cuenta de Origen";
			PRIMARY_ACCOUNT.addEventListener(
				"change",
				primaryAccountSelectionHandler
			);

			SECONDARY_ACCOUNT_LABEL.style.display = "block";
			SECONDARY_ACCOUNT.style.display = "block";
			SECONDARY_ACCOUNT.setAttribute("required", "");

			break;
		default:
			break;
	}
}

/**
 * Show the modal to create transactions, adjusted according to the
 * action selected by user.
 * @param {Event} event Button event dispatched by user
 */
function showTransactionCreator(event) {
	updateTransactionCreator(event.target.id);

	MODAL_BACKDROP.style.display = "flex";
	document.getElementById("transaction-creator").style.display = "block";
	document.body.style.overflow = "hidden";
}

/**
 * Shows the modal used to list and update CBUs.
 */
function showCBUList() {
	MODAL_BACKDROP.style.display = "flex";
	document.getElementById("cbu-manager").style.display = "block";
	document.body.style.overflow = "hidden";
}

/**
 * Closes parent modal of the button in which this handler
 * was attached.
 * @param {Event} event Button event dispatched by user
 */
function closeModal(event) {
	resetSecondaryAccountSelector();
	event.target.closest("form").classList.remove("invalid");

	const MODAL = event.target.closest(".modal");
	MODAL.querySelector(".modal-content").scroll({
		top: 0,
		left: 0,
		behavior: "instant",
	});

	MODAL_BACKDROP.style.display = "none";
	MODAL.style.display = "none";
	document.body.style.overflow = "auto";
}

function addPrimaryAccountOption(cbu, tag = "") {
	const NEW_PRIMARY = document.createElement("option");
	NEW_PRIMARY.value = cbu;
	NEW_PRIMARY.innerHTML = tag ? cbu + ` - ${tag}` : cbu;

	PRIMARY_ACCOUNT.appendChild(NEW_PRIMARY);
}

function addSecondaryAccountOption(cbu, tag = "") {
	const NEW_SECONDARY = document.createElement("option");
	NEW_SECONDARY.value = cbu;
	NEW_SECONDARY.innerHTML = tag ? cbu + ` - ${tag}` : cbu;

	SECONDARY_ACCOUNT.appendChild(NEW_SECONDARY);
}

function addCBUToAgenda(cbu) {
	const CBU_ROW = document.createElement("tr");

	const DATA_CELL = document.createElement("td");
	DATA_CELL.classList.add("cbu-number");
	DATA_CELL.textContent = cbu;

	const DELETE_CELL = document.createElement("td");
	DELETE_CELL.innerHTML = "<i class='delete-button bx bx-trash'></i>";
	DELETE_CELL.querySelector(".delete-button").addEventListener(
		"click",
		(event) => {
			if (cbuDeletionHandler(cbu)) {
				event.target.closest("tr").remove();
				SECONDARY_ACCOUNT.querySelector(
					`option[value='${cbu}']`
				)?.remove();
				verifyEmptyTable();
			}
		}
	);

	CBU_ROW.appendChild(DATA_CELL);
	CBU_ROW.appendChild(DELETE_CELL);

	enableCBUSearchButton();
	resetCBUFilter();
	CBU_LIST.insertBefore(CBU_ROW, CBU_LIST.firstChild);
	CBU_LIST.querySelector(`#${NO_CBU_MESSAGE_ID}`)?.remove();
}

/**
 * Add a new CBU on top of the list of CBUs
 * and on bottom of the secondary accounts select
 * @param {string} cbu CBU to add
 */
function bookCBU(cbu) {
	addCBUToAgenda(cbu);
	addSecondaryAccountOption(cbu);
}

function createMessageRow(message, id, span) {
	let messageRow = document.createElement("tr");
	messageRow.id = id;
	messageRow.innerHTML = `<td colspan='${span}' class='table-placeholder'>${message}</td>`;
	return messageRow;
}

/**
 * Check for existence of empty tables and add the corresponding
 * messages.
 */
function verifyEmptyTable() {
	if (CBU_LIST.childElementCount === 0) {
		CBU_LIST.appendChild(
			createMessageRow(NO_CBU_MESSAGE, NO_CBU_MESSAGE_ID, 2)
		);
		disableCBUSearchButton();
	}
}

function disableCBUSearchButton() {
	CBU_SEARCH_BUTTON.setAttribute("disabled", "");
	CBU_SEARCH_BUTTON.setAttribute(
		"title",
		"Crea al menos un cbu para poder usar esta opción"
	);
}

function enableCBUSearchButton() {
	CBU_SEARCH_BUTTON.removeAttribute("disabled");
	CBU_SEARCH_BUTTON.removeAttribute("title");
}

function resetCBUFilter() {
	CBU_LIST.querySelectorAll("tr[hidden]").forEach((hiddenCBU) => {
		hiddenCBU.removeAttribute("hidden");
	});
	CBU_LIST.querySelector(`#${NO_CBU_MATCH_MESSAGE_ID}`)?.remove();
}

/**
 *
 * @param {string} searchString
 */
function filterCBU(searchString) {
	resetCBUFilter();
	if (searchString.trim().length > 0) {
		let searchPattern = new RegExp(searchString, "g");

		CBU_LIST.querySelectorAll("tr").forEach((fila) => {
			let cbu = fila.querySelector("td.cbu-number")?.textContent;
			let coincide = cbu.match(searchPattern);
			console.log(cbu, coincide);
			if (!coincide) {
				fila.setAttribute("hidden", "");
			}
		});

		if (CBU_LIST.querySelectorAll("tr:not([hidden])").length === 0) {
			CBU_LIST.appendChild(
				createMessageRow(
					NO_CBU_MATCH_MESSAGE,
					NO_CBU_MATCH_MESSAGE_ID,
					2
				)
			);
		}
	}
}

/**
 *
 * @param {Date} date
 * @param {string} type
 * @param {string} origin
 * @param {string} destination
 * @param {number} amount
 */
function addToHistory(date, type, origin, destination, amount) {
	const FORMATTED_DATE = Utils.dateTimeFormat(date);
	const NEW_TRANSACTION = document.createElement("tr");
	NEW_TRANSACTION.innerHTML = `<td>${FORMATTED_DATE}</td>
	<td>${type}</td>
	<td title='${origin}' data-content='${origin}'>${origin}</td>
	<td title='${destination}' data-content='${destination}'>${destination}</td>
	<td>${Utils.financialFormat(amount)}</td>`;
	HISTORY.insertBefore(NEW_TRANSACTION, HISTORY.firstChild);
}

function showDialog(message) {
	alert(message);
}

function checkForm(event) {
	let form = event.target.closest("form");
	let validForm = form.checkValidity();
	if (!validForm) {
		form.classList.add("invalid");
	} else {
		form.classList.remove("invalid");
	}
}

function submitHandler(event) {
	event.preventDefault();
}

/**
 * Initialize handlers for interface elements.
 *
 * It receives a couple of functions that can be called before certain operations
 * to validate, update data model and prevent the creation of new elements on screen
 * in case of errors.
 *
 * If any of such functions return a falsy value, the operation related won't be
 * executed at all. If such functions aren't provided, the operation will be
 * always executed.
 *
 * @param {(cbu: string) => boolean} onCreateCBU - Function to call before cbu creation
 * @param {(cbu: string) => boolean} onDeleteCBU - Function to call before cbu deletion
 * @param {(cbu: string, amount: string) => {date: Date, type: string, origin: string, destination: string, amount: number}} onSubmitDeposit - Function to call before deposit creation
 * @param {(cbu: string, amount: string) => { date: Date; type: string; origin: string; destination: string; amount: number; }} onSubmitExtraction - Function to call before extraction creation
 * @param {(origin: string, destination: string, amount: string) => { date: Date; type: string; origin: string; destination: string; amount: number; }} onSubmitTransfer - Function to call before transfer creation
 */
function initHandlers(
	onCreateCBU = DEFAULT_CBU_ADD_DELETE_HANDLER,
	onDeleteCBU = DEFAULT_CBU_ADD_DELETE_HANDLER,
	onSubmitDeposit = DEFAULT_DEPOSIT_EXTRACTION_SUBMIT_HANDLER,
	onSubmitExtraction = DEFAULT_DEPOSIT_EXTRACTION_SUBMIT_HANDLER,
	onSubmitTransfer = DEFAULT_TRANSFER_SUBMIT_HANDLER
) {
	/* Used to enable iOS interactivy. 	Not applied on HTML to avoid conflicts
	on Firefox for Android */
	if (navigator.userAgent.toUpperCase().includes("MACINTOSH")) {
		document.body.setAttribute("ontouchstart", "");
	}

	/* Handler to prevent page refreshing on forms submit */
	document
		.querySelectorAll("form")
		.forEach((form) => form.addEventListener("submit", submitHandler));

	document
		.querySelectorAll("button[type=submit]")
		.forEach((subButton) => subButton.addEventListener("click", checkForm));

	/* Handler to SHOW MODAL dialogs to create transactions */
	document
		.querySelectorAll("#actions-list button.transaction-init")
		.forEach((button) => {
			button.addEventListener("click", (event) =>
				showTransactionCreator(event)
			);
		});

	/* Handler to SHOW MODAL dialogs to manage cbus */
	document.getElementById("cbu-book-button").addEventListener("click", () => {
		resetCBUFilter();
		showCBUList();
	});

	/* Handler to CLOSE MODAL dialogs */
	document.querySelectorAll("button.cancel-button").forEach((button) => {
		button.addEventListener("click", (event) => closeModal(event));
	});

	/* Handler to ADD CBUS to interface */
	document.getElementById("add-cbu").addEventListener("click", () => {
		if (onCreateCBU(CBU_INPUT.value)) {
			bookCBU(CBU_INPUT.value);
			CBU_INPUT.value = "";
		}
	});

	/* Handler to FILTER CBUS */
	CBU_SEARCH_BUTTON.addEventListener("click", () => {
		filterCBU(CBU_INPUT.value);
	});

	/* Handler to REMOVE CBUS from interface */
	cbuDeletionHandler = onDeleteCBU;

	/* Handlers to CREATE TRANSACTIONS  */
	depositSubmitHandler = onSubmitDeposit;
	extractionSubmitHandler = onSubmitExtraction;
	transferSubmitHandler = onSubmitTransfer;
}

export default {
	initHandlers,
	updateSavingAccountInfo,
	updateBasicAccountInfo,
	bookCBU,
	addToHistory,
	showDialog,
	showTransactionCreator,
	showCBUList,
	closeModal,
};
