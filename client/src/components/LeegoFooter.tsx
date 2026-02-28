export default function LeegoFooter() {
  return (
    <div className="w-full flex justify-center items-center py-8 mt-auto opacity-70 hover:opacity-100 transition-opacity duration-300">
      <img
        src="/leego-logo.png"
        alt="Created by Leego"
        className="h-24 sm:h-28 w-auto object-contain"
        draggable={false}
      />
    </div>
  );
}
