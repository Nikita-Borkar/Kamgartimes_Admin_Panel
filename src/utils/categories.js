// Categories from the backend are a flat list with `parent` (ObjectId or null).
// Subcategories are just categories with a parent — build a two-level tree for UI.

export function buildCategoryTree(categories = []) {
  const mains = categories.filter((c) => !c.parent);
  const childrenOf = (id) =>
    categories
      .filter((c) => c.parent === id)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return mains
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map((c) => ({ ...c, subcategories: childrenOf(c._id) }));
}

export function isActiveItem(cat) {
  return cat?.isActive !== false;
}
