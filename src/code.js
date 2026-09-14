const API_BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";
const FLAG_BASE_URL = "https://flagsapi.com";
const REQUEST_TIMEOUT_MS = 10000;
const currencyNames = {
  AED: "UAE Dirham", AUD: "Australian Dollar", BDT: "Bangladeshi Taka", BGN: "Bulgarian Lev",
  BHD: "Bahraini Dinar", BRL: "Brazilian Real", CAD: "Canadian Dollar", CHF: "Swiss Franc",
  CLP: "Chilean Peso", CNY: "Chinese Yuan", COP: "Colombian Peso", CZK: "Czech Koruna",
  DKK: "Danish Krone", DOP: "Dominican Peso", DZD: "Algerian Dinar", EGP: "Egyptian Pound",
  EUR: "Euro", GBP: "British Pound", GHS: "Ghanaian Cedi", HKD: "Hong Kong Dollar",
  HUF: "Hungarian Forint", IDR: "Indonesian Rupiah", ILS: "Israeli Shekel", INR: "Indian Rupee",
  JPY: "Japanese Yen", KES: "Kenyan Shilling", KRW: "South Korean Won", KWD: "Kuwaiti Dinar",
  LKR: "Sri Lankan Rupee", MAD: "Moroccan Dirham", MXN: "Mexican Peso", MYR: "Malaysian Ringgit",
  NGN: "Nigerian Naira", NOK: "Norwegian Krone", NPR: "Nepalese Rupee", NZD: "New Zealand Dollar",
  OMR: "Omani Rial", PEN: "Peruvian Sol", PHP: "Philippine Peso", PKR: "Pakistani Rupee",
  PLN: "Polish Zloty", QAR: "Qatari Riyal", RON: "Romanian Leu", RUB: "Russian Ruble",
  SAR: "Saudi Riyal", SEK: "Swedish Krona", SGD: "Singapore Dollar", THB: "Thai Baht",
  TRY: "Turkish Lira", TWD: "Taiwan Dollar", TZS: "Tanzanian Shilling", UAH: "Ukrainian Hryvnia",
  USD: "United States Dollar", UYU: "Uruguayan Peso", VND: "Vietnamese Dong", XAF: "Central African CFA Franc",
  XOF: "West African CFA Franc", ZAR: "South African Rand"
};

const countryList = {
  AED: "AE", AUD: "AU", BDT: "BD", BGN: "BG", BHD: "BH", BRL: "BR",
  CAD: "CA", CHF: "CH", CLP: "CL", CNY: "CN", COP: "CO", CZK: "CZ",
  DKK: "DK", DOP: "DO", DZD: "DZ", EGP: "EG", EUR: "DE", GBP: "GB",
  GHS: "GH", HKD: "HK", HUF: "HU", IDR: "ID", ILS: "IL", INR: "IN",
  JPY: "JP", KES: "KE", KRW: "KR", KWD: "KW", LKR: "LK", MAD: "MA",
  MXN: "MX", MYR: "MY", NGN: "NG", NOK: "NO", NPR: "NP", NZD: "NZ",
  OMR: "OM", PEN: "PE", PHP: "PH", PKR: "PK", PLN: "PL", QAR: "QA",
  RON: "RO", RUB: "RU", SAR: "SA", SEK: "SE", SGD: "SG", THB: "TH",
  TRY: "TR", TWD: "TW", TZS: "TZ", UAH: "UA", USD: "US", UYU: "UY",
  VND: "VN", XAF: "CM", XOF: "SN", ZAR: "ZA"
};

const selects = document.querySelectorAll(".country select");
const form = document.querySelector("form");
const swapButton = document.querySelector(".swap-button");
const fromCurrency = document.querySelector("#from-currency");
const toCurrency = document.querySelector("#to-currency");
const amountInput = document.querySelector("#amount");
const result = document.querySelector("#result");
const resultRate = document.querySelector("#result-rate");
const resultPanel = document.querySelector(".result-panel");
const resultStatus = document.querySelector("#result-status");
const convertButton = document.querySelector(".convert-button");
const convertButtonLabel = convertButton.querySelector("span");

for (const select of selects) {
  for (const code of Object.keys(countryList)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = code;
    option.selected = (select.name === "from" && code === "USD") ||
      (select.name === "to" && code === "INR");
    select.append(option);
  }
  select.addEventListener("change", () => updateFlag(select));
  updateFlag(select);
}

function updateFlag(select) {
  const image = select.closest(".currency-select-wrap").querySelector("img");
  const countryCode = countryList[select.value];
  const currencyName = document.querySelector(`[data-currency-name="${select.name}"]`);
  image.alt = `${select.value} flag`;
  image.src = `${FLAG_BASE_URL}/${countryCode}/flat/64.png`;
  currencyName.textContent = currencyNames[select.value] || "Currency";
  image.onerror = () => {
    image.removeAttribute("src");
    image.alt = `${select.value} flag unavailable`;
  };
}

function setResult(message, isError = false, statusMessage = "Live exchange rate") {
  result.textContent = message;
  resultStatus.textContent = statusMessage;
  resultPanel.classList.toggle("is-error", isError);
  resultPanel.classList.toggle("is-loading", statusMessage === "Fetching live rate");
  result.setAttribute("aria-live", isError ? "assertive" : "polite");
}

async function getExchangeRate() {
  const amount = Number(amountInput.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    amountInput.setCustomValidity("Enter an amount greater than zero.");
    amountInput.reportValidity();
    setResult("Enter a valid amount greater than zero.", true, "Invalid amount");
    resultRate.textContent = "Use a value greater than zero to continue.";
    return;
  }
  amountInput.setCustomValidity("");

  const from = fromCurrency.value.toLowerCase();
  const to = toCurrency.value.toLowerCase();
  setResult("Loading exchange rate...", false, "Fetching live rate");
  resultRate.textContent = "Connecting to the exchange service...";
  convertButton.disabled = true;
  convertButton.classList.add("is-loading");
  convertButtonLabel.textContent = "Updating rate...";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}/${from}.json`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Exchange service returned ${response.status}.`);
    const data = await response.json();
    const rate = data?.[from]?.[to];
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("The selected currencies are unavailable.");
    setResult(`${amount} ${fromCurrency.value} = ${(amount * rate).toFixed(2)} ${toCurrency.value}`);
    resultRate.textContent = `1 ${fromCurrency.value} = ${rate.toFixed(4)} ${toCurrency.value}`;
  } catch (error) {
    const message = error.name === "AbortError"
      ? "The request timed out. Please try again."
      : "Unable to load the exchange rate. Please try again.";
    setResult(message, true, "Rate unavailable");
    resultRate.textContent = "Check your connection and try again.";
  } finally {
    clearTimeout(timeout);
    convertButton.disabled = false;
    convertButton.classList.remove("is-loading");
    convertButtonLabel.textContent = "Convert";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  getExchangeRate();
});

swapButton.addEventListener("click", () => {
  const previousFrom = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = previousFrom;
  updateFlag(fromCurrency);
  updateFlag(toCurrency);
  getExchangeRate();
});

getExchangeRate();
