import synagogueImage from "../assets/synagogue.svg";

// כרזה בראש הלוח: כותרת, הסבר קצר ואיור של בית כנסת
function Hero() {
  return (
    <section className="hero">
      <div>
        <h1>לוח מניינים עירוני</h1>
        <p>כל זמני המניינים בבתי הכנסת בעיר, במקום אחד. בחרו תפילה, ימים או בית כנסת ומצאו מניין.</p>
      </div>
      <img src={synagogueImage} alt="איור של בית כנסת" />
    </section>
  );
}

export default Hero;
