const FeedbackCard = ({ name, feedback }) => {
  return (
    <div className="relative w-[300px] h-[180px] bg-white rounded-xl overflow-hidden shadow-lg transform rotate-[3deg]">
      {/* Background circles */}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#015265] rounded-full z-0" />
      <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-[#015265] rounded-full z-0" />

      {/* White slanted box */}
      <div className="absolute inset-0 bg-white rotate-[357deg] z-10 rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-black">{name}</h3>
          <div className="w-20 h-20 bg-teal-800 rounded-full flex items-center justify-center text-yellow-400 text-sm">
            ★★★★☆
          </div>
        </div>
        <p className="text-black text-sm">{feedback}</p>
      </div>
    </div>
  );
};
export default FeedbackCard;
