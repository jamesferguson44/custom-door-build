import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductTypeTabs } from "@/components/configurator/ProductTypeTabs";
import { OptionGroup } from "@/components/configurator/OptionGroup";
import { SizeInputs } from "@/components/configurator/SizeInputs";
import { PriceSummary } from "@/components/configurator/PriceSummary";
import { ProductPreview } from "@/components/configurator/ProductPreview";
import { ProjectSummary } from "@/components/configurator/ProjectSummary";
import {
  DEFAULT_DOOR,
  DEFAULT_WINDOW,
  calculatePrice,
  isValidSize,
  productLabel,
  WINDOW_STYLES,
  PRODUCT_LINES,
  type DoorConfig,
  type ProductType,
  type WindowConfig,
} from "@/lib/pricing";
import heroWindow from "@/assets/hero-window.jpg";
import heroDoor from "@/assets/hero-door.jpg";
import heroSliding from "@/assets/hero-sliding.jpg";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const VALID_TYPES: ProductType[] = ["window", "door", "sliding_door"];

type TemplateId = "best-value" | "most-popular" | "max-efficiency" | "modern-upgrade";

const WINDOW_TEMPLATES: Record<TemplateId, Partial<WindowConfig>> = {
  "best-value": { productLine: "Good — AMSCO", glassType: "Standard", windowStyle: "Single Hung", color: "White" },
  "most-popular": { productLine: "Better — ProVia", glassType: "Low-E", windowStyle: "Double Hung", color: "White" },
  "max-efficiency": { productLine: "Best — ProVia Aeris", glassType: "Triple Pane", windowStyle: "Casement", color: "White" },
  "modern-upgrade": { productLine: "Better — ProVia", glassType: "Low-E", windowStyle: "Picture", color: "Black" },
};

function CustomBrandRequest({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState<boolean>(Boolean(value));
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-sm font-medium"
      >
        Need a specific brand or specialty product?
        <span className="text-muted-foreground text-xs">{open ? "Hide" : "Add request"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <Label htmlFor="custom-brand" className="text-xs text-muted-foreground">
            Tell us what you're looking for
          </Label>
          <Textarea
            id="custom-brand"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Andersen 400 Series, Pella Reserve, custom shape, etc."
            className="min-h-[80px]"
          />
        </div>
      )}
    </div>
  );
}

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

export const Route = createFileRoute("/configure/$type")({
  beforeLoad: ({ params }) => {
    if (!VALID_TYPES.includes(params.type as ProductType)) throw notFound();
  },
  validateSearch: (s: Record<string, unknown>) => ({
    template: typeof s.template === "string" ? (s.template as TemplateId) : undefined,
  }),
  head: ({ params }) => {
    const t = params.type as ProductType;
    const label = productLabel(t);
    return {
      meta: [
        { title: `Configure ${label} — Pane & Simple` },
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
  summary,
  complete,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  summary?: string;
  complete?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const collapsed = complete && !open;
  return (
    <section className="border-t border-border pt-10 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => complete && setOpen((o) => !o)}
        className={cn(
          "group mb-6 flex w-full items-center justify-between gap-3 text-left",
          complete ? "cursor-pointer" : "cursor-default",
        )}
      >
        <div className="flex items-baseline gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {complete && <Check className="h-3 w-3 text-foreground/70" />}
            Step {String(step).padStart(2, "0")}
          </span>
          <h2 className={cn("font-semibold tracking-tight", collapsed ? "text-lg text-muted-foreground" : "text-2xl")}>
            {title}
          </h2>
        </div>
        {complete && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {collapsed && summary && <span className="hidden sm:inline">{summary}</span>}
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
              {collapsed ? "Edit" : "Hide"}
              <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            </span>
          </div>
        )}
      </button>
      {!collapsed && (
        <>
          {description && (
            <p className="mb-6 -mt-3 text-sm text-muted-foreground">{description}</p>
          )}
          <div className="space-y-8">{children}</div>
        </>
      )}
    </section>
  );
}

function WindowConfigurator({ productType }: { productType: ProductType }) {
  const { template } = Route.useSearch();
  const [config, setConfig] = useState<WindowConfig>(() => {
    const preset = template ? WINDOW_TEMPLATES[template as TemplateId] : undefined;
    return { ...DEFAULT_WINDOW, ...(preset ?? {}) };
  });
  const valid = isValidSize(config.width, config.height);
  const price = useMemo(() => calculatePrice("window", config), [config]);

  return (
    <Shell productType={productType}>
      <div>
        <StepSection
          step={1}
          title="Window Style"
          description="Choose how your window opens and operates. You can change this anytime."
          summary={config.windowStyle}
        >
          <OptionGroup
            label="Window Style"
            value={config.windowStyle}
            options={WINDOW_STYLES}
            onChange={(v) => setConfig({ ...config, windowStyle: v })}
          />
        </StepSection>

        <StepSection
          step={2}
          title="Product Line"
          description="Pick the quality tier that fits your project. Most homeowners choose Better."
          summary={config.productLine}
        >
          <OptionGroup
            label="Product Line"
            value={config.productLine}
            options={PRODUCT_LINES}
            onChange={(v) => setConfig({ ...config, productLine: v })}
            descriptions={{
              "Good — AMSCO": "Affordable and energy efficient",
              "Better — ProVia": "Upgraded efficiency and premium vinyl performance",
              "Best — ProVia Aeris": "Real wood interior and maximum performance",
            }}
            badges={{
              "Better — ProVia": "Most Popular",
            }}
          />
          <CustomBrandRequest
            value={config.customRequest ?? ""}
            onChange={(v) => setConfig({ ...config, customRequest: v })}
          />
        </StepSection>

        <StepSection
          step={3}
          title="Glass"
          description="Choose glass that matches your climate goals. Low-E is the smart default for most homes."
          summary={config.glassType}
        >
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
            badges={{
              "Low-E": "Recommended",
            }}
          />
        </StepSection>

        <StepSection
          step={4}
          title="Style & Color"
          description="Personalize the look. Easy to change later."
          summary={`${config.color} · ${config.gridStyle}`}
        >
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

        <StepSection
          step={5}
          title="Measurements"
          description="Last step. A rough width × height is all we need to give you a price."
          complete={valid}
          summary={valid ? `${config.width}″ × ${config.height}″` : undefined}
        >
          <SizeInputs
            width={config.width}
            height={config.height}
            onChange={(width, height) => setConfig({ ...config, width, height })}
          />
        </StepSection>

      </div>
      <div className="space-y-6 lg:sticky lg:top-20">
        <ProductPreview productType={productType} config={config} />
        <PriceSummary
          productType={productType}
          config={config}
          price={price}
          valid={valid}
          onAddedToProject={() =>
            setConfig({ ...config, width: 0, height: 0 })
          }
        />
        <ProjectSummary />
      </div>
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
      <div className="space-y-6 lg:sticky lg:top-20">
        <ProductPreview productType={productType} config={config} />
        <PriceSummary
          productType={productType}
          config={config}
          price={price}
          valid={valid}
          onAddedToProject={() =>
            setConfig({ ...config, width: 0, height: 0 })
          }
        />
        <ProjectSummary />
      </div>
    </Shell>
  );
}
