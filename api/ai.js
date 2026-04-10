export default async function handler(req, res) {
  // DUMMY TEST - NO API CALL
  try {
    const { prompt } = req.body;
    return res.status(200).json({ reply: "DUMMY TEST: Risel is online! If you see this, the server connection is PERFECT." });
  } catch (err) {
    return res.status(500).json({ error: "DUMMY FAIL: " + err.message });
  }
}
