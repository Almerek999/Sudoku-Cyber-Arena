import './globals.css';

export const metadata = {
  title: 'Sudoku Cyber',
  description: 'AI-powered Sudoku Arena',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Добавлен suppressHydrationWarning — это уберет ошибку в консоли
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}