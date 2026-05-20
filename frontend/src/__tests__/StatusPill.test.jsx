import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  AnimatePresence: ({ children }) => children,
}));

vi.spyOn(console, 'log').mockImplementation(() => {});

const { StatusPill } = await import('../DashboardPage.jsx');

describe('StatusPill', () => {
  test('CONFIRMEE → label "Confirmée" et fond vert', () => {
    const { container } = render(<StatusPill status="CONFIRMEE" />);
    expect(screen.getByText(/Confirmée/i)).toBeTruthy();
    expect(container.firstChild.style.backgroundColor).toBe('rgb(220, 252, 231)');
  });

  test('EN_ATTENTE → label "En attente" et fond jaune', () => {
    const { container } = render(<StatusPill status="EN_ATTENTE" />);
    expect(screen.getByText(/En attente/i)).toBeTruthy();
    expect(container.firstChild.style.backgroundColor).toBe('rgb(254, 243, 199)');
  });

  test('REFUSEE → label "Refusée" et fond rouge', () => {
    const { container } = render(<StatusPill status="REFUSEE" />);
    expect(screen.getByText(/Refusée/i)).toBeTruthy();
    expect(container.firstChild.style.backgroundColor).toBe('rgb(254, 226, 226)');
  });

  test('statut inconnu → repli sur EN_ATTENTE', () => {
    render(<StatusPill status="INEXISTANT" />);
    expect(screen.getByText(/En attente/i)).toBeTruthy();
  });
});
