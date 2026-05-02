import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductTypeTabs } from "@/components/configurator/ProductTypeTabs";
import { OptionGroup } from "@/components/configurator/OptionGroup";
import { SizeInputs } from "@/components/configurator/SizeInputs";
import { PriceSummary } from "@/components/configurator/PriceSummary";
import {
  DEFAULT_DOOR,
  DEFAULT_WINDOW,
  calculatePrice,
  isValidSize,
  productLabel,
  type DoorConfig,
  type ProductType,
  type WindowConfig,
} from "@/lib/pricing";
import heroWindow from "@/assets/hero-window.jpg";
import heroDoor from "@/assets/hero-door.jpg";
import heroSliding from "@/assets/hero-sliding.jpg";

const VALID_TYPES: ProductType[] = ["window", "door", "sliding_door"];

const HERO: Record<ProductType, string> = {
  window: heroWindow,
  door: heroDoor,
  sliding_door: heroSliding,
};

const TAGLINE: Record<ProductType, string> = {
  window: "Built to your opening. Engineered for Utah weather.",
  door: "A statement entry, made to your specs.",
  sliding_door: "Bring the outdoors in with smooth-glide patio doors.",
};

export const Route = createFileRoute("/configure/")({
  beforeLoad: ({ params }) => {
    if (!VALID_TYPES.includes(params.type as ProductType)) throw notFound();
  },
  head: ({ params }) => {
    const t = params.type as ProductType;
    const label = productLabel(t);
    return {
      meta: [
        { title: `Configure ${label} — Utah Window & Door` },
        {
          name: "description",
          content: `Build your custom ${label.toLowerCase()} and see live pricing instantly.`,
        },
      ],
    };
  },
  component: ConfigurePage,
});

function ConfigurePage() {
  const { type } = Route.useParams();
  const productType = type as ProductType;
  return productType === "window" ? (
    <WindowConfigurator productType={productType} />
  ) : (
    <DoorConfigurator productType={productType} />
  );
}

function Hero({ productType }: { productType: ProductType }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted">
      <img
        src={HERO[productType]}
        alt={`${productLabel(productType)} preview`}
        width={1920}
        height={1080}
        className="h-[44vh] w-full object-cover sm:h-[52vh]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-[1400px] px-6 pb-8 sm:pb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Configurator
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
                {productLabel(productType)}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                {TAGLINE[productType]}
              </p>
            </div>
            <ProductTypeTabs active={productType} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Shell({
  productType,
  children,
}: {
  productType: ProductType;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero productType={productType} />
      <div className="mx-auto max-w-[1400px] px-6 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-12">
          {children}
        </div>
      </div>
    </div>
  );
}

function StepSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-10 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
          Step {String(step).padStart(2, "0")}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {description && (
        <p className="mb-6 -mt-3 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function WindowConfigurator({ productType }: { productType: ProductType }) {
  const [config, setConfig] = useState<WindowConfig>(DEFAULT_WINDOW);
  const valid = isValidSize(config.width, config.height);
  const price = useMemo(() => calculatePrice("window", config), [config]);

  return (
    <Shell productType={productType}>
      <div>
        <StepSection step={1} title="Measurements" description="Measure the rough opening, width × height.">
          <SizeInputs
            width={config.width}
            height={config.height}
            onChange={(width, height) => setConfig({ ...config, width, height })}
          />
        </StepSection>

        <StepSection step={2} title="Frame & Glass" description="Choose materials that match your home and climate goals.">
          <OptionGroup
            label="Frame Material"
            value={config.frameMaterial}
            options={["Vinyl", "Fiberglass", "Aluminum"] as const}
            onChange={(v) => setConfig({ ...config, frameMaterial: v })}
            descriptions={{
              Vinyl: "Best value, low maintenance",
              Fiberglass: "Strongest, premium finish",
              Aluminum: "Slim profile, modern look",
            }}
          />
          <OptionGroup
            label="Glass Type"
            value={config.glassType}
            options={["Standard", "Low-E", "Triple Pane"] as const}
            onChange={(v) => setConfig({ ...config, glassType: v })}
            descriptions={{
              Standard: "Dual pane",
              "Low-E": "Energy efficient",
              "Triple Pane": "Maximum insulation",
            }}
          />
        </StepSection>

        <StepSection step={3} title="Style" description="Personalize the look.">
          <OptionGroup
            label="Grid Style"
            value={config.gridStyle}
            options={["None", "Colonial", "Prairie"] as const}
            onChange={(v) => setConfig({ ...config, gridStyle: v })}
          />
          <OptionGroup
            label="Color"
            value={config.color}
            options={["White", "Black", "Custom"] as const}
            onChange={(v) => setConfig({ ...config, color: v })}
          />
        </StepSection>

        <StepSection step={4} title="Installation">
          <OptionGroup
            label="Install Type"
            value={config.installation}
            options={["Retrofit", "Full Frame"] as const}
            onChange={(v) => setConfig({ ...config, installation: v })}
            descriptions={{
              Retrofit: "Insert into existing frame",
              "Full Frame": "Complete tear-out & rebuild",
            }}
          />
        </StepSection>
      </div>
      <PriceSummary productType={productType} config={config} price={price} valid={valid} />
    </Shell>
  );
}

function DoorConfigurator({ productType }: { productType: ProductType }) {
  const [config, setConfig] = useState<DoorConfig>(DEFAULT_DOOR);
  const valid = isValidSize(config.width, config.height);
  const price = useMemo(() => calculatePrice(productType, config), [productType, config]);

  return (
    <Shell productType={productType}>
      <div>
        <StepSection step={1} title="Measurements" description="Width and height of the rough opening.">
          <SizeInputs
            width={config.width}
            height={config.height}
            onChange={(width, height) => setConfig({ ...config, width, height })}
          />
        </StepSection>

        <StepSection step={2} title="Material & Glass">
          <OptionGroup
            label="Material"
            value={config.material}
            options={["Wood", "Fiberglass", "Steel"] as const}
            onChange={(v) => setConfig({ ...config, material: v })}
            descriptions={{
              Wood: "Classic, warm",
              Fiberglass: "Durable, low maintenance",
              Steel: "Strongest, secure",
            }}
          />
          <OptionGroup
            label="Glass Option"
            value={config.glassOption}
            options={["None", "Half", "Full"] as const}
            onChange={(v) => setConfig({ ...config, glassOption: v })}
          />
        </StepSection>

        <StepSection step={3} title="Finish & Hardware">
          <OptionGroup
            label="Finish"
            value={config.finish}
            options={["Painted", "Stained"] as const}
            onChange={(v) => setConfig({ ...config, finish: v })}
          />
          <OptionGroup
            label="Hardware"
            value={config.hardware}
            options={["Basic", "Premium"] as const}
            onChange={(v) => setConfig({ ...config, hardware: v })}
            descriptions={{
              Basic: "Standard lockset",
              Premium: "Smart lock & designer handle",
            }}
          />
        </StepSection>
      </div>
      <PriceSummary productType={productType} config={config} price={price} valid={valid} />
    </Shell>
  );
}
