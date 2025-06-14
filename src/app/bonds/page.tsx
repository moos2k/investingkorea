import Footer from "../components/Footer";

export default function BondsPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">💰 채권 및 예금</h1>
      <p className="text-lg leading-relaxed">
        채권과 예금은 상대적으로 안정적인 수익을 추구하는 투자 방식입니다.
        원금 보장성과 정기 이자 수익을 기반으로 포트폴리오의 안정성을 높일 수 있습니다.
      </p>
      <Footer />
    </main>
  );
}