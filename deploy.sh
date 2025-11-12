#!/bin/bash

# Deployment script for Prompt Enhancer v3.0

echo "🚀 Starting deployment to Vercel..."
echo ""

# Set environment variable
export OPENAI_API_KEY="your_openai_api_key_here"

# Deploy with Vercel
npx vercel --prod --yes \
  --name prompt-enhancer-v3 \
  --env OPENAI_API_KEY="$OPENAI_API_KEY"

echo ""
echo "✅ Deployment complete!"
