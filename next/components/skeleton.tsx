const arrayMap = Array.from(Array(6).keys());

const Skeleton = () => {
  return (
    <div id="skeleton" className="flex flex-col space-y-4">
      {arrayMap.map((_, index) => (
        <div
          key={index}
          className="flex p-4 rounded-xl gap-4 bg-white/40 animate-pulse"
        >
          <div className=" w-12 h-12 bg-indigo-300"></div>
          <div className="flex flex-col gap-2 w-full">
            <div className="h-4 bg-indigo-300 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-indigo-300 rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
