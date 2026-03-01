export default function LeegoFooter() {
  return (
    <div className="w-full flex justify-center items-center py-8 mt-auto">
      <img
        src="/leego-logo.png"
        alt="Created by Leego"
        className="h-24 sm:h-28 w-auto object-contain leego-glow"
        draggable={false}
      />
    </div>
  );
}
