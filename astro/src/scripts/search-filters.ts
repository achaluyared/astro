let filterTeardown: (() => void) | null = null;

function initSearchFilters() {
  filterTeardown?.();

  const form = document.getElementById('filters') as HTMLFormElement | null;
  if (!form) return;

  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty');
  const citySelect = form.elements.namedItem('city') as HTMLSelectElement | null;

  const cards = () => Array.from(document.querySelectorAll<HTMLElement>('#grid .card'));

  const apply = () => {
    const q = (form.q as HTMLInputElement).value.trim().toLowerCase();
    const min = (form.min as HTMLInputElement).value ? Number((form.min as HTMLInputElement).value) : null;
    const max = (form.max as HTMLInputElement).value ? Number((form.max as HTMLInputElement).value) : null;
    const verified = (form.verified as HTMLInputElement).checked;
    const featured = (form.featured as HTMLInputElement).checked;
    const sponsored = (form.sponsored as HTMLInputElement).checked;
    const isNew = (form.new as HTMLInputElement).checked;
    const city = citySelect?.value ?? '';

    let shown = 0;
    for (const c of cards()) {
      const age = c.dataset.age ? Number(c.dataset.age) : null;
      const ok =
        (!q || c.dataset.name!.includes(q)) &&
        (min === null || (age !== null && age >= min)) &&
        (max === null || (age !== null && age <= max)) &&
        (!verified || c.dataset.verified === '1') &&
        (!featured || c.dataset.featured === '1') &&
        (!sponsored || c.dataset.sponsored === '1') &&
        (!isNew || c.dataset.new === '1') &&
        (!city || c.dataset.city === city);
      c.hidden = !ok;
      if (ok) shown++;
    }
    if (count) count.textContent = `${shown} profile${shown === 1 ? '' : 's'}`;
    if (empty) empty.hidden = shown > 0;

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (min !== null) params.set('min', String(min));
    if (max !== null) params.set('max', String(max));
    if (verified) params.set('verified', '1');
    if (featured) params.set('featured', '1');
    if (sponsored) params.set('sponsored', '1');
    if (isNew) params.set('new', '1');
    if (city) params.set('city', city);
    const qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  };

  const params = new URLSearchParams(location.search);
  (form.q as HTMLInputElement).value = params.get('q') ?? params.get('s') ?? '';
  (form.min as HTMLInputElement).value = params.get('min') ?? '';
  (form.max as HTMLInputElement).value = params.get('max') ?? '';
  (form.verified as HTMLInputElement).checked = params.get('verified') === '1';
  (form.featured as HTMLInputElement).checked = params.get('featured') === '1';
  (form.sponsored as HTMLInputElement).checked = params.get('sponsored') === '1';
  (form.new as HTMLInputElement).checked = params.get('new') === '1';
  if (citySelect) citySelect.value = params.get('city') ?? '';

  form.addEventListener('input', apply);
  if (citySelect) citySelect.addEventListener('change', apply);
  apply();

  filterTeardown = () => {
    form.removeEventListener('input', apply);
    if (citySelect) citySelect.removeEventListener('change', apply);
  };
}

initSearchFilters();
document.addEventListener('astro:page-load', initSearchFilters);
