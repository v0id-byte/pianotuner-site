/** 蓝图发丝网格——约 2KB 内联 SVG，68px 间距。测量的隐喻。 */
export default function BlueprintGrid({ innerRef, className = 'hero__grid' }) {
  const P = 68, W = 1512, H = 1010;
  const v = [];
  for (let x = P; x < W; x += P) v.push(x);
  const h = [];
  for (let y = P; y < H; y += P) h.push(y);
  return (
    <svg ref={innerRef} className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g stroke="#8d8d8d" strokeOpacity="0.28" strokeWidth="0.673286">
        {v.map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} />)}
        {h.map((y) => <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} />)}
      </g>
    </svg>
  );
}
