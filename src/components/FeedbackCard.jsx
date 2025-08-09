const FeedbackCard = ({ name, feedback }) => {
  return (
    <div className="relative w-[300px] h-[200px] bg-[#015265] rounded-2xl overflow-hidden shadow-xl transform transition-transform  duration-300 hover:scale-105">
      {/* Decorative circles (optional, reduced size for subtlety) */}
      <div className="absolute -left-12 -top-6 w-24 h-24 bg-[#027373] rounded-full opacity-50 z-0" />
      <div className="absolute -right-10 -bottom-8 w-24 h-24 bg-[#027373] rounded-full opacity-50 z-0" />

      {/* Card Content */}
      <div className="relative z-10 p-4 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{name}</h3>
          <div className="flex items-center space-x-1">
            {Array(4)
              .fill()
              .map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">
                  ★☆
                </span>
              ))}
          </div>
        </div>
        <p className="text-sm leading-relaxed">{feedback}</p>
      </div>
    </div>
  );
};
export default FeedbackCard;