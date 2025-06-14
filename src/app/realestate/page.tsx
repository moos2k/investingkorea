import Footer from "../components/Footer";

export default function RealEstatePage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📍 부동산 투자란?</h1>
      <p className="text-lg leading-relaxed">
        부동산 투자는 주택, 상가, 토지 등을 구입하거나 임대하여 자산 가치를 올리는 투자 방식입니다.
        실거주 목적뿐 아니라 임대 수익, 시세차익을 얻기 위한 목적도 포함됩니다.
      </p>
      <Footer />
    </main>
  );
}