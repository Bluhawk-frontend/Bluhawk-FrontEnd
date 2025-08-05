import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Harmless", value: 40, color: "green" },
  { name: "Malicious", value: 30, color: "#FF8042" },
  { name: "Other", value: 30, color: "gray" },
];

function PieChartComp() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          startAngle={90}
          endAngle={450}
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PieChartComp;
