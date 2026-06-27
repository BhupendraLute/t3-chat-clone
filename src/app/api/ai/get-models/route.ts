import { NextRequest, NextResponse } from "next/server";

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
    request: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    input_modalities: string[];
    output_modalities: string[];
  };
  top_provider: {
    max_completion_tokens: number;
    is_moderated: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }

    const data: { data: OpenRouterModel[] } = await response.json();

    const freeModels = data.data.filter((model: OpenRouterModel) => {
      const promptPrice = parseFloat(model.pricing?.completion || "0");
      const completionPrice = parseFloat(model.pricing?.prompt || "0");

      return promptPrice === 0 && completionPrice === 0;
    });

    const formattedModels = freeModels.map((model: OpenRouterModel) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      pricing: model.pricing,
      context_length: model.context_length,
      architecture: model.architecture,
      top_provider: model.top_provider,
    }));

    return NextResponse.json({ models: formattedModels });
  } catch (error) {
    console.error("Error fetching free models: ", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch models" },
      { status: 500 },
    );
  }
}
