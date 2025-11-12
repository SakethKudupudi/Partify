import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  total: 0,
  addToCart: (inventoryId, quantity) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.inventory_id === inventoryId);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.inventory_id === inventoryId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      return {
        items: [
          ...state.items,
          { inventory_id: inventoryId, quantity, id: Date.now() }
        ]
      };
    });
  },
  removeFromCart: (inventoryId) => {
    set((state) => ({
      items: state.items.filter((item) => item.inventory_id !== inventoryId)
    }));
  },
  clearCart: () => {
    set({ items: [], total: 0 });
  }
}));

export default useCartStore;

