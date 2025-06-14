export default function HomePage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">📊 투자 정보 플랫폼 - InvestingKorea</h1>
      <p className="text-lg mb-4">부동산, 주식, 채권 등 다양한 투자 방법을 소개합니다.</p>
      <ul className="list-disc pl-5 text-blue-600">
        <li><a href="/realestate">🏠 부동산 투자</a></li>
        <li><a href="/stock">📈 주식 투자</a></li>
        <li><a href="/bonds">💰 채권 및 예금</a></li>
        <li><a href="/about">ℹ️ 사이트 소개</a></li>
      </ul>
    </main>
  );
}