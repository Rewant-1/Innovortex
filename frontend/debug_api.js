const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function debugAPI() {
  console.log("🔍 Debugging Gemini API connection...\n");
  
  // Check if API key is loaded
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log("1. API Key loaded:", apiKey ? "✅ Yes" : "❌ No");
  console.log("2. API Key length:", apiKey ? apiKey.length : "N/A");
  console.log("3. API Key format:", apiKey ? (apiKey.startsWith("AIza") ? "✅ Valid format" : "❌ Invalid format") : "N/A");
  
  if (!apiKey) {
    console.log("\n❌ No API key found. Please check your .env file.");
    return;
  }
  
  try {
    console.log("\n4. Testing API connection...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Simple test with a very short prompt
    const result = await model.generateContent("Hello");
    console.log("✅ API connection successful!");
    console.log("Response:", result.response.text());
    
  } catch (error) {
    console.log("❌ API connection failed:");
    console.log("Error type:", error.constructor.name);
    console.log("Status:", error.status || "Unknown");
    console.log("Message:", error.message);
    
    if (error.status === 400) {
      console.log("\n🔧 Troubleshooting tips:");
      console.log("- Verify your API key is correct");
      console.log("- Check if Generative Language API is enabled in Google Cloud Console");
      console.log("- Ensure your API key has no restrictions blocking this service");
      console.log("- Try regenerating your API key");
    }
  }
}

debugAPI();