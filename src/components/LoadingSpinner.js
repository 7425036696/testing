export default function LoadingSpinner() {
  return (
    <div className="text-center py-16">
      <div className="relative inline-block">
        {/* Main spinner */}
        <div className="w-20 h-20 border-4 border-gray-700 border-t-orange-500 border-r-orange-400 rounded-full animate-spin mx-auto mb-8"></div>
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 w-20 h-20 mx-auto">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-500/20 to-orange-400/20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white">
          Creating Magic ✨
        </h3>
        <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
          Our AI is crafting the perfect thumbnails for you. This usually takes 10-30 seconds.
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
