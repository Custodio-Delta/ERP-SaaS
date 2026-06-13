import QRCode from "qrcode";

/**
 * Gera o payload de um Pix Copia-e-Cola no padrão EMV do Banco Central do Brasil.
 */
export function generatePixPayload(
  pixKey: string,
  amount: number,
  merchantName: string = "Modern ERP SaaS",
  merchantCity: string = "Sao Paulo",
  txId: string = "***"
): string {
  const formatValue = (val: number) => val.toFixed(2);
  const amountStr = formatValue(amount);

  let payload = "";
  payload += "000201"; // Payload Format Indicator
  payload += "010211"; // Point of Initiation Method

  // Merchant Account Information
  const gui = "0014br.gov.bcb.pix";
  const key = `01${pixKey.length.toString().padStart(2, "0")}${pixKey}`;
  const accountInfo = `${gui}${key}`;
  payload += `26${accountInfo.length.toString().padStart(2, "0")}${accountInfo}`;

  payload += "52040000"; // Merchant Category Code
  payload += "5303986"; // Transaction Currency
  payload += `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`; // Transaction Amount
  payload += "5802BR"; // Country Code

  // Merchant Name
  payload += `59${merchantName.length.toString().padStart(2, "0")}${merchantName}`;
  // Merchant City
  payload += `60${merchantCity.length.toString().padStart(2, "0")}${merchantCity}`;

  // Additional Data Field Template
  const txIdField = `05${txId.length.toString().padStart(2, "0")}${txId}`;
  payload += `62${txIdField.length.toString().padStart(2, "0")}${txIdField}`;

  // CRC16 inicial
  payload += "6304";
  
  // Cálculo do CRC16
  const crc = getCRC16(payload);
  payload += crc;

  return payload;
}

/**
 * Calcula o CRC16 padrão CCITT-FALSE necessário para o Pix.
 */
function getCRC16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Gera um QR Code em formato Base64 a partir do payload Pix.
 */
export async function generatePixQRCode(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    return "";
  }
}
