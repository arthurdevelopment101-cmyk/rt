import { Order } from "../types";

export interface SpreadsheetInfo {
  id: string;
  url: string;
  title: string;
}

/**
 * Creates a new Google Sheet for storing orders.
 * Returns the created spreadsheet's ID, title, and URL.
 */
export async function createOrdersSpreadsheet(accessToken: string, title: string = "Vero Luxury Boutique - Orders"): Promise<SpreadsheetInfo> {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Google Sheet: ${errorText}`);
  }

  const data = await response.json();
  const id = data.spreadsheetId;
  const url = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`;

  // Initialize spreadsheet headers
  await initializeSpreadsheetHeaders(accessToken, id);

  return { id, url, title };
}

/**
 * Initializes the columns of the newly created sheet.
 */
async function initializeSpreadsheetHeaders(accessToken: string, spreadsheetId: string) {
  const headers = [
    [
      "كود الطلب / Order ID",
      "الرقم المرجعي / Order Number",
      "العميل / Customer Name",
      "الإيميل / Email",
      "الهاتف / Phone",
      "العنوان / Address",
      "المدينة / City",
      "التاريخ / Date",
      "المنتجات / Products Details",
      "كود الخصم / Promo Code",
      "قيمة التوصيل / Delivery",
      "الإجمالي بالجنيه / Total (EGP)",
      "الحالة / Status",
      "تاريخ التحديث / Last Updated"
    ]
  ];

  const range = "Sheet1!A1:N1";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range: range,
      majorDimension: "ROWS",
      values: headers,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Failed to initialize spreadsheet headers:", errText);
  }
}

/**
 * Appends a list of orders to the Google Sheet.
 * Checks for existing order numbers in the sheet to avoid duplication if possible,
 * or simply appends new records.
 */
export async function appendOrdersToSheet(accessToken: string, spreadsheetId: string, orders: Order[]) {
  if (orders.length === 0) return;

  // Convert orders to rows
  const rows = orders.map(order => {
    const productsDetails = order.items?.map(item => 
      `${item.product.name} (Qty: ${item.quantity}, Size: ${item.selectedSize || 'N/A'}, Material: ${item.selectedMaterial || 'N/A'})`
    ).join(" | ") || "";

    return [
      order.id,
      `#${order.orderNumber || ""}`,
      order.shippingName || "",
      order.shippingEmail || "",
      order.shippingPhone || "",
      order.shippingAddress || "",
      order.shippingCity || "",
      order.date || "",
      productsDetails,
      (order as any).promoCode || "None",
      "EGP 50", // delivery fee is now 50 EGP
      order.total || 0,
      order.status || "Pending",
      new Date().toLocaleString()
    ];
  });

  const range = "Sheet1!A:N";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range: range,
      majorDimension: "ROWS",
      values: rows,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to append orders: ${errText}`);
  }
}

/**
 * Fetches existing records in Sheet1 to help detect which orders are already synced.
 */
export async function getSyncedOrderIds(accessToken: string, spreadsheetId: string): Promise<Set<string>> {
  try {
    const range = "Sheet1!A2:A1000";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return new Set();
    }

    const data = await response.json();
    if (!data.values) return new Set();

    const ids = data.values.map((row: string[]) => row[0]).filter(Boolean);
    return new Set(ids);
  } catch (err) {
    console.error("Error reading order IDs from Sheet:", err);
    return new Set();
  }
}
