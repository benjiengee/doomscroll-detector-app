from transformers import AutoModelForSequenceClassification, AutoTokenizer
from peft import PeftModel
import torch
from torch.nn.functional import sigmoid
from flask import Flask, request, jsonify
from flask_cors import CORS

####### SETUP ######## 
model_name = "roberta-large"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("../model/lora-roberta-productivity")

# Load base model
base_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=1)

# Attach LoRA adapters
model = PeftModel.from_pretrained(base_model, "../model/lora-roberta-productivity")
model.to(device)
model.eval()

def predict_productivity(title: str) -> float:
    inputs = tokenizer(title, return_tensors="pt", truncation=True, padding=True, max_length=32).to(device)
    with torch.no_grad():
        logits = model(**inputs).logits
        prob = sigmoid(logits).item()
    return prob

productive_threshold = 0.65 # <<<<<<<<<<< PROBABILITY THRESHOLD FOR PRODUCTIVE VIDEO

####### SERVER ######## 
app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    """Endpoint that receives a JSON with 'text' and returns 0 or 1."""
    data = request.json
    title = data.get("text", "")

    if not title:
        return jsonify({"error": "No text provided"}), 400

    prob = predict_productivity(title)
    result = 1 if prob >= productive_threshold else 0
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)