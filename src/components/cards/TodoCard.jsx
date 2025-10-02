const TodoCard = ({ todos }) => {
  return (
    <div className="border-2 border-white/20 bg-black/40 backdrop-blur-sm p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-white"></div>
        <h2 className="text-white uppercase tracking-wide font-medium text-sm">
          Tasks
        </h2>
      </div>

      {/* Todo Items */}
      <div className="space-y-4">
        {todos?.slice(0, 4).map((todo, index) => (
          <div key={index} className="flex items-start gap-4 group">
            {/* Checkbox */}
            <div className={`w-6 h-6 border-2 ${todo.urgent ? 'border-orange-400' : 'border-white/30'} flex items-center justify-center mt-1`}>
              {todo.done && <div className="w-3 h-3 bg-white" />}
            </div>

            {/* Task content */}
            <div className="flex-1">
              <div className={`text-white text-xl ${todo.done ? 'line-through opacity-50' : ''}`}>
                {todo.text}
              </div>
              {todo.urgent && !todo.done && (
                <div className="text-orange-400 text-xs tracking-wider uppercase mt-1">
                  Urgent
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoCard;