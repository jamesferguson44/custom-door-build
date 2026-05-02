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

const VALID_TYPES: ProductType[] = ["window", "door", "sliding_door"];

export const Route = createFileRoute("/configure/$type")({
  beforeLoad: ({ params }) => {
    if (!VALID_TYPES.includes(params.type as ProductType)) {
      throw notFound();
    }
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
  const isWindow = productType === "window";

  return isWindow ? (
    <WindowConfigurator productType={productType} />
  ) : (
    <DoorConfigurator productType={productType} />
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
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Configure {productLabel(productType)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize every detail and see your price update instantly.
            </p>
          </div>
          <ProductTypeTabs active={productType} />
        </div>
        {children}
      </div>
    </div>
  );
}

function WindowConfigurator({ productType }: { productType: ProductType }) {
  const [config, setConfig] = useState<WindowConfig>(DEFAULT_WINDOW);
  const valid = isValidSize(config.width, config.height);
  const price = useMemo(() => calculatePrice("window", config), [config]);

  return (
    <Shell productType={productType}>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <SizeInputs
            width={config.width}
            height={config.height}
            onChange={(width, height) => setConfig({ ...config, width, height })}
          />
          <OptionGroup
            label="Frame Material"
            value={config.frameMaterial}
            options={["Vinyl", "Fiberglass", "Aluminum"] as const}
            onChange={(v) => setConfig({ ...config, frameMaterial: v })}
          />
          <OptionGroup
            label="Glass Type"
            value={config.glassType}
            options={["Standard", "Low-E", "Triple Pane"] as const}
            onChange={(v) => setConfig({ ...config, glassType: v })}
          />
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
          <OptionGroup
            label="Installation Type"
            value={config.installation}
            options={["Retrofit", "Full Frame"] as const}
            onChange={(v) => setConfig({ ...config, installation: v })}
          />
        </div>
        <PriceSummary productType={productType} config={config} price={price} valid={valid} />
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
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <SizeInputs
            width={config.width}
            height={config.height}
            onChange={(width, height) => setConfig({ ...config, width, height })}
          />
          <OptionGroup
            label="Material"
            value={config.material}
            options={["Wood", "Fiberglass", "Steel"] as const}
            onChange={(v) => setConfig({ ...config, material: v })}
          />
          <OptionGroup
            label="Glass Option"
            value={config.glassOption}
            options={["None", "Half", "Full"] as const}
            onChange={(v) => setConfig({ ...config, glassOption: v })}
          />
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
          />
        </div>
        <PriceSummary productType={productType} config={config} price={price} valid={valid} />
      </div>
    </Shell>
  );
}
