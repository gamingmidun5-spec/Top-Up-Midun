import crypto from "crypto";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).json({
      result: true,
      message: "CORS OK"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      result: false,
      message: "Method tidak diperbolehkan."
    });
  }

  try {
    const {
      user_id,
      zone_id,
      service,
      product_name,
      amount
    } = req.body || {};

    // Validasi
    if (!user_id || !zone_id || !service || !amount) {
      return res.status(400).json({
        result: false,
        message:
          "User ID, Zone ID, service, dan amount wajib diisi."
      });
    }

    const SERVER_KEY =
      process.env.MIDTRANS_SERVER_KEY;

    if (!SERVER_KEY) {
      console.error(
        "MIDTRANS_SERVER_KEY tidak tersedia."
      );

      return res.status(500).json({
        result: false,
        message:
          "Midtrans Server Key belum dikonfigurasi."
      });
    }

    // ID transaksi unik
    const orderId =
      "MIDUUN-" +
      Date.now() +
      "-" +
      crypto.randomBytes(3).toString("hex");

    const grossAmount =
      Number(amount);

    if (
      !Number.isInteger(grossAmount) ||
      grossAmount <= 0
    ) {
      return res.status(400).json({
        result: false,
        message: "Nominal pembayaran tidak valid."
      });
    }

    // Request ke Midtrans Sandbox
    const response = await fetch(
      "https://api.sandbox.midtrans.com/v2/charge",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization":
            "Basic " +
            Buffer.from(
              SERVER_KEY + ":"
            ).toString("base64")
        },
        body: JSON.stringify({
          payment_type: "qris",

          transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount
          },

          item_details: [
            {
              id: service,
              price: grossAmount,
              quantity: 1,
              name:
                product_name ||
                "Mobile Legends"
            }
          ],

          metadata: {
            user_id: String(user_id),
            zone_id: String(zone_id),
            service: String(service)
          }
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "MIDTRANS ERROR:",
        data
      );

      return res.status(502).json({
        result: false,
        message:
          data.status_message ||
          "Gagal membuat pembayaran Midtrans.",
        midtrans: data
      });
    }

    return res.status(200).json({
      result: true,
      message:
        "Pembayaran berhasil dibuat.",
      order_id: orderId,
      transaction_id:
        data.transaction_id,
      transaction_status:
        data.transaction_status,
      gross_amount:
        data.gross_amount,
      actions:
        data.actions || []
    });

  } catch (error) {
    console.error(
      "PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      result: false,
      message:
        "Terjadi kesalahan pada server pembayaran.",
      error:
        error.message ||
        "Unknown error"
    });
  }
}
