import type {
  AnyConfig,
  DoorConfig,
  ProductType,
  WindowConfig,
} from "@/lib/pricing";
import { productLabel } from "@/lib/pricing";

type Props = {
  productType: ProductType;
  config: AnyConfig;
  id?: string;
};

/**
 * Dynamic visual preview of the configured window/door.
 * Pure SVG — re-renders instantly on any config change.
 */
export function ProductPreview({ productType, config, id = "preview" }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-muted/10">
      <div className="hidden lg:flex items-center justify-between border-b border-border px-5 py-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Live Preview
        </div>
        <div className="text-[11px] tabular-nums text-muted-foreground">
          {config.width}″ × {config.height}″
        </div>
      </div>
      <div className="flex aspect-[16/9] lg:aspect-[4/3] items-center justify-center p-2 lg:p-6">
        {productType === "window" ? (
          <WindowPreview config={config as WindowConfig} id={id} />
        ) : (
          <DoorPreview config={config as DoorConfig} isSliding={productType === "sliding_door"} id={id} />
        )}
      </div>
      <div className="hidden lg:block border-t border-border bg-card/50 px-5 py-3 text-[11px] text-muted-foreground">
        {productType === "window"
          ? `${(config as WindowConfig).windowStyle} · ${(config as WindowConfig).color} · ${(config as WindowConfig).glassType} · ${(config as WindowConfig).gridStyle === "None" ? "No grids" : `${(config as WindowConfig).gridStyle} grids`}`
          : productType === "sliding_door"
          ? `${(config as DoorConfig).panelCount ?? 2}-Panel · ${(config as DoorConfig).frameColor ?? "White"} · ${(config as DoorConfig).glassEfficiency ?? "Low-E"}`
          : `${productLabel(productType)} · live preview updates with your selections`}
      </div>
    </div>
  );
}

/* ------------------------- WINDOW ------------------------- */

function WindowPreview({ config, id }: { config: WindowConfig; id: string }) {
  // Maintain real proportions while fitting into a 320x240 viewBox.
  const maxW = 280;
  const maxH = 200;
  const ratio = (config.width || 36) / (config.height || 48);
  let w = maxW;
  let h = maxW / ratio;
  if (h > maxH) {
    h = maxH;
    w = maxH * ratio;
  }
  const x = (320 - w) / 2;
  const y = (240 - h) / 2;

  const frameColor =
    config.color === "Black"
      ? "#1a1a1a"
      : config.color === "Custom"
      ? "#6b5b4a"
      : "#f0f0ee";
  const frameStroke =
    config.color === "Black" ? "#000" :
    config.color === "Custom" ? "#5a4a3a" :
    "#8a8a84";
  const frameInner =
    config.color === "Black" ? "#0d0d0d" :
    config.color === "Custom" ? "#7a6a5a" :
    "#d0d0ca";
  const overlayStroke = config.color === "White" ? "#888888" : frameStroke;


  // Glass tint based on glass type
  const glassFill =
    config.glassType === "Triple Pane"
      ? `url(#${id}-glass-triple)`
      : config.glassType === "Low-E"
      ? `url(#${id}-glass-lowe)`
      : `url(#${id}-glass-std)`;

  const frameThick = 10;
  const gx = x + frameThick;
  const gy = y + frameThick;
  const gw = w - frameThick * 2;
  const gh = h - frameThick * 2;

  return (
    <svg
      viewBox="0 0 320 240"
      className="h-full w-full"
      role="img"
      aria-label="Window preview"
    >
      <defs>
        <linearGradient id={`${id}-glass-std`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbe7ee" />
          <stop offset="100%" stopColor="#aac3d1" />
        </linearGradient>
        <linearGradient id={`${id}-glass-lowe`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cfe4dd" />
          <stop offset="100%" stopColor="#7fb0a3" />
        </linearGradient>
        <linearGradient id={`${id}-glass-triple`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c7d8e6" />
          <stop offset="100%" stopColor="#6b8aa4" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Drop shadow */}
      <rect
        x={x + 4}
        y={y + 6}
        width={w}
        height={h}
        rx={4}
        fill="#000"
        opacity={0.08}
      />

      {/* Frame */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill={frameColor}
        stroke={frameStroke}
        strokeWidth={1}
      />
      {/* Inner frame bevel */}
      <rect
        x={x + 3}
        y={y + 3}
        width={w - 6}
        height={h - 6}
        rx={2}
        fill="none"
        stroke={frameInner}
        strokeWidth={1}
      />

      {/* Glass */}
      <rect x={gx} y={gy} width={gw} height={gh} fill={glassFill} />
      {/* Glass shine */}
      <rect x={gx} y={gy} width={gw} height={gh} fill={`url(#${id}-shine)`} />

      {/* Style-specific sash overlays */}
      {config.gridStyle === "None" && (
        <StyleOverlay
          style={config.windowStyle}
          x={gx}
          y={gy}
          w={gw}
          h={gh}
          frameColor={frameColor}
          frameStroke={overlayStroke}
        />
      )}


      {/* Extra sheen for Low-E / Triple Pane */}
      {config.glassType !== "Standard" && (
        <rect
          x={gx}
          y={gy}
          width={gw}
          height={gh}
          fill={config.glassType === "Triple Pane" ? "#3a6b8a" : "#5a9e8a"}
          opacity={0.08}
        />
      )}

      {/* Grid overlay */}
      <GridOverlay
        style={config.gridStyle}
        windowStyle={config.windowStyle}
        x={gx}
        y={gy}
        w={gw}
        h={gh}
        color={frameColor}
        stroke={frameStroke}
      />
    </svg>
  );
}

function StyleOverlay({
  style,
  x,
  y,
  w,
  h,
  frameColor,
  frameStroke,
}: {
  style: WindowConfig["windowStyle"];
  x: number;
  y: number;
  w: number;
  h: number;
  frameColor: string;
  frameStroke: string;
}) {
  const t = 4;
  if (style === "Picture" || style === "Specialty") return null;
  if (style === "Single Hung" || style === "Double Hung") {
    // Horizontal sash bar in the middle
    const my = y + h / 2 - t / 2;
    return (
      <g>
        <rect x={x} y={my} width={w} height={t} fill={frameColor} stroke={frameStroke} strokeWidth={0.5} />
        {/* Small lift indicator */}
        <rect x={x + w / 2 - 8} y={my + t + 2} width={16} height={2} rx={1} fill={frameStroke} opacity={0.5} />
      </g>
    );
  }
  if (style === "Slider") {
    // Vertical sash bar in the middle
    const mx = x + w / 2 - t / 2;
    return (
      <g>
        <rect x={mx} y={y} width={t} height={h} fill={frameColor} stroke={frameStroke} strokeWidth={0.5} />
      </g>
    );
  }
  if (style === "Casement") {
    // Side-hinge crank indicator (diagonal lines from hinge)
    return (
      <g stroke={frameStroke} strokeWidth={0.8} opacity={0.5} fill="none">
        <line x1={x} y1={y} x2={x + w} y2={y + h / 2} />
        <line x1={x} y1={y + h} x2={x + w} y2={y + h / 2} />
      </g>
    );
  }
  if (style === "Awning") {
    // Top-hinge open indicator
    return (
      <g stroke={frameStroke} strokeWidth={0.8} opacity={0.5} fill="none">
        <line x1={x} y1={y} x2={x + w / 2} y2={y + h} />
        <line x1={x + w} y1={y} x2={x + w / 2} y2={y + h} />
      </g>
    );
  }
  return null;
}

function PaneGrid({
  style,
  x,
  y,
  w,
  h,
  color,
  stroke,
}: {
  style: WindowConfig["gridStyle"];
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  stroke: string;
}) {
  if (style === "None") return null;
  const t = 2.5;

  if (style === "Colonial") {
    const v1 = x + w / 3 - t / 2;
    const v2 = x + (2 * w) / 3 - t / 2;
    const h1 = y + h / 3 - t / 2;
    const h2 = y + (2 * h) / 3 - t / 2;
    return (
      <g>
        <rect x={v1} y={y} width={t} height={h} fill={stroke} stroke={stroke} strokeWidth={0.5} />
        <rect x={v2} y={y} width={t} height={h} fill={stroke} stroke={stroke} strokeWidth={0.5} />
        <rect x={x} y={h1} width={w} height={t} fill={stroke} stroke={stroke} strokeWidth={0.5} />
        <rect x={x} y={h2} width={w} height={t} fill={stroke} stroke={stroke} strokeWidth={0.5} />
      </g>

    );
  }

  // Prairie: border-style grid set in from edges
  const inset = Math.min(w, h) * 0.18;
  return (
    <g>
      <rect
        x={x + inset}
        y={y}
        width={t}
        height={h}
        fill={stroke}
        stroke={stroke}
        strokeWidth={0.5}
      />
      <rect
        x={x + w - inset - t}
        y={y}
        width={t}
        height={h}
        fill={stroke}
        stroke={stroke}
        strokeWidth={0.5}
      />
      <rect
        x={x}
        y={y + inset}
        width={w}
        height={t}
        fill={stroke}
        stroke={stroke}
        strokeWidth={0.5}
      />
      <rect
        x={x}
        y={y + h - inset - t}
        width={w}
        height={t}
        fill={stroke}
        stroke={stroke}
        strokeWidth={0.5}
      />

    </g>
  );
}

function GridOverlay({
  style,
  windowStyle,
  x,
  y,
  w,
  h,
  color,
  stroke,
}: {
  style: WindowConfig["gridStyle"];
  windowStyle: WindowConfig["windowStyle"];
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  stroke: string;
}) {
  if (style === "None") return null;
  const sash = 4;

  if (windowStyle === "Single Hung" || windowStyle === "Double Hung") {
    const topH = h / 2 - sash / 2;
    const botY = y + h / 2 + sash / 2;
    const botH = h / 2 - sash / 2;
    return (
      <g>
        <PaneGrid style={style} x={x} y={y} w={w} h={topH} color={color} stroke={stroke} />
        <PaneGrid style={style} x={x} y={botY} w={w} h={botH} color={color} stroke={stroke} />
      </g>
    );
  }

  if (windowStyle === "Slider") {
    const leftW = w / 2 - sash / 2;
    const rightX = x + w / 2 + sash / 2;
    const rightW = w / 2 - sash / 2;
    return (
      <g>
        <PaneGrid style={style} x={x} y={y} w={leftW} h={h} color={color} stroke={stroke} />
        <PaneGrid style={style} x={rightX} y={y} w={rightW} h={h} color={color} stroke={stroke} />
      </g>
    );
  }

  return <PaneGrid style={style} x={x} y={y} w={w} h={h} color={color} stroke={stroke} />;
}

/* ------------------------- DOOR ------------------------- */

function DoorPreview({ config, isSliding, id }: { config: DoorConfig; isSliding: boolean; id: string }) {
  const maxW = isSliding ? 290 : 200;
  const maxH = isSliding ? 170 : 220;
  const defaultRatio = isSliding
    ? (config.panelCount ?? 2) * 0.6
    : (config.width ?? 36) / (config.height ?? 80);
  const ratio = (config.width && config.height)
    ? (config.width / config.height)
    : defaultRatio;
  let w = maxW;
  let h = maxW / ratio;
  if (h > maxH) {
    h = maxH;
    w = maxH * ratio;
  }
  const x = (320 - w) / 2;
  const y = (240 - h) / 2;

  // Material/finish color
  const woodPainted = "#ececea";
  const woodStained = "#7a4a26";
  const fiberglassPainted = "#e2e0db";
  const fiberglassStained = "#8a5a32";
  const steelPainted = "#cfd2d4";
  const steelStained = "#3a3a3a";

  const doorColor =
    config.material === "Wood"
      ? config.finish === "Stained"
        ? woodStained
        : woodPainted
      : config.material === "Steel"
      ? config.finish === "Stained"
        ? steelStained
        : steelPainted
      : config.finish === "Stained"
      ? fiberglassStained
      : fiberglassPainted;

  const slidingFrameColor =
    config.frameColor === "Black" ? "#1a1a1a"
    : config.frameColor === "Bronze" ? "#7a5c3a"
    : "#f0f0ee";

  const slidingFrameStroke =
    config.frameColor === "Black" ? "#000"
    : config.frameColor === "Bronze" ? "#5a3e20"
    : "#ccccca";

  const stroke = "#2a2a2a33";
  const handleColor = config.hardware === "Premium" ? "#c9a24b" : "#9a9a9a";

  return (
    <svg
      viewBox="0 0 320 240"
      className="h-full w-full"
      role="img"
      aria-label="Door preview"
    >
      <defs>
        <linearGradient id={`${id}-door-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbe7ee" />
          <stop offset="100%" stopColor="#90b0c2" />
        </linearGradient>
        <linearGradient id={`${id}-door-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* Threshold / floor line */}
      <rect x={x - 8} y={y + h} width={w + 16} height={3} fill="#999" opacity={0.4} />

      {/* Drop shadow */}
      <rect x={x + 4} y={y + 6} width={w} height={h} rx={2} fill="#000" opacity={0.1} />

      {isSliding ? (
        <SlidingDoorBody
          x={x}
          y={y}
          w={w}
          h={h}
          doorColor={slidingFrameColor}
          stroke={slidingFrameStroke}
          handleColor={handleColor}
          glassOption={config.glassOption}
          panelCount={config.panelCount ?? 2}
          id={id}
        />
      ) : (
        <SingleDoorBody
          x={x}
          y={y}
          w={w}
          h={h}
          doorColor={doorColor}
          stroke={stroke}
          handleColor={handleColor}
          glassOption={config.glassOption}
          id={id}
        />
      )}
    </svg>
  );
}

function SingleDoorBody({
  x,
  y,
  w,
  h,
  doorColor,
  stroke,
  handleColor,
  glassOption,
  id,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  doorColor: string;
  stroke: string;
  handleColor: string;
  glassOption: DoorConfig["glassOption"];
  id: string;
}) {
  const pad = 8;
  const innerX = x + pad;
  const innerY = y + pad;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  return (
    <g>
      {/* Door slab */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill={doorColor} stroke={stroke} />
      {/* Subtle vertical shading */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${id}-door-shine)`} />

      {glassOption === "Full" && (
        <rect
          x={innerX}
          y={innerY}
          width={innerW}
          height={innerH}
          fill={`url(#${id}-door-glass)`}
          stroke={stroke}
        />
      )}

      {glassOption === "Half" && (
        <>
          <rect
            x={innerX}
            y={innerY}
            width={innerW}
            height={innerH * 0.5}
            fill={`url(#${id}-door-glass)`}
            stroke={stroke}
          />
          {/* Lower panels */}
          <rect
            x={innerX}
            y={innerY + innerH * 0.55}
            width={innerW}
            height={innerH * 0.45}
            fill="none"
            stroke={stroke}
          />
        </>
      )}

      {glassOption === "None" && (
        <>
          {/* Decorative panels */}
          <rect
            x={innerX}
            y={innerY}
            width={innerW}
            height={innerH * 0.45}
            fill="none"
            stroke={stroke}
          />
          <rect
            x={innerX}
            y={innerY + innerH * 0.5}
            width={innerW}
            height={innerH * 0.5}
            fill="none"
            stroke={stroke}
          />
        </>
      )}

      {/* Handle */}
      <circle cx={x + w - 12} cy={y + h * 0.55} r={2.5} fill={handleColor} />
      <rect
        x={x + w - 16}
        y={y + h * 0.55 - 1.2}
        width={8}
        height={2.4}
        rx={1.2}
        fill={handleColor}
      />
    </g>
  );
}

function SlidingDoorBody({
  x,
  y,
  w,
  h,
  doorColor,
  stroke,
  handleColor,
  glassOption,
  panelCount = 2,
  id,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  doorColor: string;
  stroke: string;
  handleColor: string;
  glassOption: DoorConfig["glassOption"];
  panelCount?: number;
  id: string;
}) {
  void glassOption;
  const panelW = w / panelCount;
  const frame = 5;

  // Handle side: "right" = inner edge of rightward-sliding panel
  //              "left"  = inner edge of leftward-sliding panel
  //              null    = fixed panel, no handle
  const handleSideMap: Record<number, ("right" | "left" | null)[]> = {
    2: ["right", null],
    3: ["right", null, "left"],
    4: [null, "right", "left", null],
  };
  const handleSides = handleSideMap[panelCount] ?? ["right", null];

  const renderPanel = (px: number, handleSide: "right" | "left" | null, i: number) => (
    <g key={i}>
      {/* Panel slab */}
      <rect
        x={px}
        y={y}
        width={panelW}
        height={h}
        fill={doorColor}
        stroke={stroke}
        strokeWidth={0.75}
      />
      {/* Glass */}
      <rect
        x={px + frame}
        y={y + frame}
        width={panelW - frame * 2}
        height={h - frame * 2}
        fill={`url(#${id}-door-glass)`}
        stroke={stroke}
        strokeWidth={0.5}
      />
      {/* Handle — slim recessed pull on the inner edge of sliding panels */}
      {handleSide === "right" && (
        <rect
          x={px + panelW - 8}
          y={y + h * 0.5 - 8}
          width={2.5}
          height={16}
          rx={1.2}
          fill={handleColor}
          opacity={0.85}
        />
      )}
      {handleSide === "left" && (
        <rect
          x={px + 5}
          y={y + h * 0.5 - 8}
          width={2.5}
          height={16}
          rx={1.2}
          fill={handleColor}
          opacity={0.85}
        />
      )}
    </g>
  );

  return (
    <g>
      {/* Top track */}
      <rect x={x - 4} y={y - 5} width={w + 8} height={5} rx={1} fill="#c0c0be" />
      {/* Bottom track */}
      <rect x={x - 4} y={y + h} width={w + 8} height={5} rx={1} fill="#c0c0be" />
      {/* Panel dividers — thin vertical lines between panels */}
      {Array.from({ length: panelCount - 1 }).map((_, i) => (
        <rect
          key={i}
          x={x + (i + 1) * panelW - 1}
          y={y}
          width={2}
          height={h}
          fill={stroke}
          opacity={0.3}
        />
      ))}
      {Array.from({ length: panelCount }).map((_, i) =>
        renderPanel(x + i * panelW, handleSides[i], i)
      )}
    </g>
  );
}
