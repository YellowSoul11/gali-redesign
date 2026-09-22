import { sizeCharts, sizeChartNote, howToMeasure } from '../../data/sizeCharts';
import type { Dept } from '../../data/catalog';
import { Sheet } from '../ui/Sheet';

/** Real Gali size chart for the product's department; the selected size row is highlighted. */
export function SizeGuide({ open, onClose, dept, selected }: { open: boolean; onClose: () => void; dept: Dept; selected?: string }) {
  const chart = sizeCharts[dept === 'women' ? 'women' : dept === 'men' ? 'men' : 'kids'];
  return (
    <Sheet open={open} onClose={onClose} labelledBy="sg-title" title="טבלת מידות" width="w-[min(94vw,480px)]">
      <div className="p-5">
        <h3 className="font-bold text-lg">{chart.title}</h3>
        <table className="mt-4 w-full text-[14px] num">
          <thead>
            <tr className="text-ink-2 text-[13px] border-b border-ink/30">
              <th className="text-start font-semibold py-2.5">מידה EU</th>
              <th className="text-start font-semibold py-2.5">מידה US</th>
              <th className="text-start font-semibold py-2.5">אורך כף הרגל (ס״מ)</th>
            </tr>
          </thead>
          <tbody>
            {chart.rows.map(([eu, us, cm]) => (
              <tr key={eu} className={`border-b border-line ${eu === selected ? 'bg-ink text-paper font-semibold' : ''}`} aria-current={eu === selected ? 'true' : undefined}>
                <td className="py-2.5 px-1">{eu}</td><td className="py-2.5">{us}</td><td className="py-2.5">{cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[12px] text-ink-3">*{sizeChartNote}</p>
        <h3 className="mt-8 font-bold">איך מודדים?</h3>
        <p className="soft mt-2 text-[15px] text-ink-2 leading-relaxed">{howToMeasure}</p>
      </div>
    </Sheet>
  );
}
