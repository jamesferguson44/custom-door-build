import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Save, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Style", "Product Line", "Glass", "Style & Color", "Measurements", "Location"];

const WINDOW_STYLE_DESC: Record<string, string> = {
  "Single Hung": "Traditional and affordable",
  "Double Hung": "Easy cleaning and ventilation",
  Casement: "Maximum airflow and efficiency",
  Picture: "Large unobstructed views",
  Slider: "Great for wider openings",
  Awning: "Ventilation even during rain",
  Specialty: "Custom shapes and architectural designs",
};

function ProgressBar({ done, active, labels }: { done: Record<number, boolean>; active: number; labels: string[] }) {
  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-card/60 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
      <ol className="flex items-center gap-2 sm:gap-3">
        {labels.map((label, i) => {
          const n = i + 1;
          const isDone = done[n];
          const isActive = active === n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums transition-colors",
                  isDone
                    ? "border-foreground bg-foreground text-background"
                    : isActive
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : n}
              </div>
              <span
                className={cn(
                  "truncate text-xs transition-colors sm:text-[13px]",
                  isActive ? "font-medium text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/70",
                )}
              >
                {label}
              </span>
              {i < labels.length - 1 && (
                <div
                  className={cn(
                    "hidden h-px flex-1 transition-colors sm:block",
                    isDone ? "bg-foreground/60" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

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

const HERO_EYEBROW: Record<ProductType, string> = {
  window: "Online Window Configurator · Instant Pricing",
  door: "Online Door Configurator · Instant Pricing",
  sliding_door: "Online Patio Door Configurator · Instant Pricing",
};

const HERO_TITLE: Record<ProductType, string> = {
  window: "Build Your Replacement Windows",
  door: "Configure Your Replacement Door",
  sliding_door: "Configure Your Sliding Patio Door",
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
                {HERO_EYEBROW[productType]}
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
                {HERO_TITLE[productType]}
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
  active,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  summary?: string;
  complete?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-t border-border pt-10 first:border-t-0 first:pt-0 transition-all duration-300",
        active && "rounded-2xl border border-foreground/15 bg-muted/30 px-5 py-6 -mx-5 my-2 first:pt-6 border-l-4 border-l-foreground",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {complete && <Check className="h-3 w-3 text-emerald-600" />}
            Step {String(step).padStart(2, "0")}
          </span>
          <div className="mt-1 flex items-center gap-2">
            {complete && <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
            <h2 className={cn("text-2xl font-semibold tracking-tight", active && "text-foreground")}>
              {title}
            </h2>
          </div>
          {summary && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
              <span className="text-muted-foreground">Selected:</span>
              <span>{summary}</span>
            </div>
          )}
        </div>
      </div>
      <div>
        {description && (
          <p className="mb-6 -mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="space-y-8">{children}</div>
      </div>
    </section>
  );
}

function WindowConfigurator({ productType }: { productType: ProductType }) {
  const { template } = Route.useSearch();
  const [config, setConfig] = useState<WindowConfig>(() => {
    const preset = template ? WINDOW_TEMPLATES[template as TemplateId] : undefined;
    if (!template && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("uwd_window_config_v1");
        if (raw) {
          const saved = JSON.parse(raw) as Partial<WindowConfig>;
          return { ...DEFAULT_WINDOW, ...saved };
        }
      } catch {
        /* ignore */
      }
    }
    return { ...DEFAULT_WINDOW, ...(preset ?? {}) };
  });
  const [touched, setTouched] = useState<Record<number, boolean>>(() => {
    if (template) return { 1: true, 2: true, 3: true, 4: true };
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("uwd_window_touched_v1");
        if (raw) return JSON.parse(raw) as Record<number, boolean>;
      } catch {
        /* ignore */
      }
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem("uwd_window_config_v1", JSON.stringify(config));
      localStorage.setItem("uwd_window_touched_v1", JSON.stringify(touched));
    } catch {
      /* ignore */
    }
  }, [config, touched]);

  const mark = (n: number) => setTouched((t) => (t[n] ? t : { ...t, [n]: true }));
  const valid = isValidSize(config.width, config.height);
  const price = useMemo(() => calculatePrice("window", config), [config]);
  const [location, setLocation] = useState("");
  const locationValid = location.trim().length > 0;

  const stepDone: Record<number, boolean> = {
    1: !!touched[1],
    2: !!touched[2],
    3: !!touched[3],
    4: !!touched[4],
    5: valid,
    6: locationValid,
  };
  const activeStep = [1, 2, 3, 4, 5, 6].find((n) => !stepDone[n]) ?? 0;
  const completeness =
    (stepDone[1] ? 0.13 : 0) +
    (stepDone[2] ? 0.13 : 0) +
    (stepDone[3] ? 0.12 : 0) +
    (stepDone[4] ? 0.12 : 0) +
    (stepDone[5] ? 0.4 : 0) +
    (locationValid ? 0.1 : 0);

  return (
    <Shell productType={productType}>
      <div>
        <ProgressBar done={stepDone} active={activeStep} />
        <StepSection
          step={1}
          title="Window Style"
          description="Choose how your window opens. Change it anytime."
          summary={config.windowStyle}
          complete={stepDone[1]}
          active={activeStep === 1}
        >
          <OptionGroup
            label="Window Style"
            value={config.windowStyle}
            options={WINDOW_STYLES}
            onChange={(v) => {
              setConfig({ ...config, windowStyle: v });
              mark(1);
            }}
            descriptions={WINDOW_STYLE_DESC as Partial<Record<typeof config.windowStyle, string>>}
          />
        </StepSection>

        <StepSection
          step={2}
          title="Product Line"
          description="Most homeowners choose Better — premium vinyl with Low-E glass."
          summary={config.productLine}
          complete={stepDone[2]}
          active={activeStep === 2}
        >
          <OptionGroup
            label="Product Line"
            value={config.productLine}
            options={PRODUCT_LINES}
            onChange={(v) => {
              setConfig({ ...config, productLine: v });
              mark(2);
            }}
            descriptions={{
              "Good — AMSCO": "Affordable · Energy efficient · Best budget option",
              "Better — ProVia": "Better efficiency · Premium vinyl construction · Recommended",
              "Best — ProVia Aeris": "Maximum efficiency · Real wood interior · Premium upgrade",
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
          description="Low-E is recommended for Utah's climate and the most common pick."
          summary={config.glassType}
          complete={stepDone[3]}
          active={activeStep === 3}
        >
          <OptionGroup
            label="Glass Type"
            value={config.glassType}
            options={["Standard", "Low-E", "Triple Pane"] as const}
            onChange={(v) => {
              setConfig({ ...config, glassType: v });
              mark(3);
            }}
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
          description="Personalize the finish. Easy to change later."
          summary={`${config.color} Exterior · ${config.gridStyle === "None" ? "No Grids" : `${config.gridStyle} Grids`}`}
          complete={stepDone[4]}
          active={activeStep === 4}
        >
          <OptionGroup
            label="Grid Style"
            value={config.gridStyle}
            options={["None", "Colonial", "Prairie"] as const}
            onChange={(v) => {
              setConfig({ ...config, gridStyle: v });
              mark(4);
            }}
          />
          <OptionGroup
            label="Color"
            value={config.color}
            options={["White", "Black", "Custom"] as const}
            onChange={(v) => {
              setConfig({ ...config, color: v });
              mark(4);
            }}
          />
        </StepSection>

        <StepSection
          step={5}
          title="Measurements"
          description="Approximate measurements are completely fine — a professional verifies exact numbers before production."
          complete={stepDone[5]}
          active={activeStep === 5}
          summary={valid ? `${config.width}″ × ${config.height}″` : undefined}
        >
          <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-100">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-medium">Don't worry if your measurements aren't perfect.</div>
              <div className="mt-0.5 text-[13px] opacity-80">
                Most homeowners enter approximate sizes. We verify exact measurements before ordering.
              </div>
            </div>
          </div>
          <SizeInputs
            width={config.width}
            height={config.height}
            onChange={(width, height) => setConfig({ ...config, width, height })}
          />
        </StepSection>

        <StepSection
          step={6}
          title="Room or Location"
          description="Name this window's room so we can organize your quote and installation."
          summary={locationValid ? location.trim() : undefined}
          complete={stepDone[6]}
          active={activeStep === 6}
        >
          <div className="space-y-2">
            <Label htmlFor="room-location-step" className="text-sm font-medium">
              Room or location name <span className="text-foreground">*</span>
            </Label>
            <Input
              id="room-location-step"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Living Room, Kitchen, Master Bedroom..."
            />
            <p className="text-[12px] text-muted-foreground">
              This helps us organize your quote and schedule installation by room.
            </p>
          </div>
        </StepSection>

      </div>
      <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto space-y-6 pb-6">
        <ProductPreview productType={productType} config={config} />
        <PriceSummary
          productType={productType}
          config={config}
          price={price}
          valid={valid}
          completeness={completeness}
          location={location}
          locationValid={locationValid}
          onAddedToProject={() => {
            setConfig({ ...config, width: 0, height: 0 });
            setLocation("");
          }}
        />
        <ProjectSummary />
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Save className="h-3 w-3" /> Project automatically saved.
        </div>
      </div>
    </Shell>
  );
}

function DoorConfigurator({ productType }: { productType: ProductType }) {
  return <DoorConfiguratorInner productType={productType} />;
}

function CurrentConfigCard({
  config,
  valid,
  price,
}: {
  config: WindowConfig;
  valid: boolean;
  price: { low: number; high: number };
}) {
  const rows = [
    { label: `${config.windowStyle} Window`, on: !!config.windowStyle },
    { label: config.productLine, on: !!config.productLine },
    { label: `${config.glassType} Glass`, on: !!config.glassType },
    { label: `${config.color} Exterior`, on: !!config.color },
    { label: config.gridStyle === "None" ? "No Grids" : `${config.gridStyle} Grids`, on: !!config.gridStyle },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="px-6 py-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Your Window
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              {r.on ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-dashed border-muted-foreground/40" />
              )}
              <span className={r.on ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            {valid ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-dashed border-muted-foreground/40" />
            )}
            <span className={valid ? "text-foreground" : "text-muted-foreground"}>
              {valid ? `${config.width}″ × ${config.height}″` : "Measurements pending"}
            </span>
          </li>
        </ul>
      </div>
      <div className="border-t border-border bg-muted/30 px-6 py-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Estimated Starting Price
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
          {valid
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price.low)
            : "—"}
        </div>
        <div className="text-[11px] text-muted-foreground">Installed, before measurement verification</div>
      </div>
    </div>
  );
}

function DoorConfiguratorInner({ productType }: { productType: ProductType }) {
  const [config, setConfig] = useState<DoorConfig>(DEFAULT_DOOR);
  const valid = isValidSize(config.width, config.height);
  const price = useMemo(() => calculatePrice(productType, config), [productType, config]);
  const [location, setLocation] = useState("");
  const locationValid = location.trim().length > 0;

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
      <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto space-y-6 pb-6">
        <ProductPreview productType={productType} config={config} />
        <PriceSummary
          productType={productType}
          config={config}
          price={price}
          valid={valid}
          location={location}
          locationValid={locationValid}
          onAddedToProject={() => {
            setConfig({ ...config, width: 0, height: 0 });
            setLocation("");
          }}
        />
        <ProjectSummary />
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Save className="h-3 w-3" /> Project automatically saved.
        </div>
      </div>
    </Shell>
  );
}
