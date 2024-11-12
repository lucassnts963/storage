function generateTable(data) {
  const container = document.getElementById("table-container");
  container.innerHTML = ""; // Limpa o conteúdo existente
  const table = document.createElement("table");
  table.className = "table table-sm table-bordered";

  const stepsList = [
    "Montar andaime",
    "Aberto",
    "Desmontado",
    "Limpeza",
    "Trocado",
    "Fechado",
    "Montado",
    "Desm. andaime",
    "Concluído",
  ];

  // Cria o cabeçalho da tabela
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Coluna de cabeçalho "activity"
  const activityHeader = document.createElement("th");
  activityHeader.innerText = "activity";
  activityHeader.style.fontSize = "12px";
  headerRow.appendChild(activityHeader);

  // Cabeçalhos para cada etapa
  stepsList.forEach((step) => {
    const stepHeader = document.createElement("th");
    stepHeader.innerText = step;
    stepHeader.style.fontSize = "10px";
    stepHeader.style.writingMode = "vertical-rl"; // Texto na vertical
    stepHeader.style.transform = "rotate(180deg)"; // Inverte para leitura de baixo para cima
    headerRow.appendChild(stepHeader);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Criação do corpo da tabela
  const tbody = document.createElement("tbody");

  data.activities.forEach((activity) => {
    const row = document.createElement("tr");

    // Coluna da activity
    const activityCell = document.createElement("td");
    activityCell.innerText = activity.description;
    activityCell.style.fontSize = "10px";
    row.appendChild(activityCell);

    // Colunas para cada etapa
    stepsList.forEach((step, index) => {
      const stepCell = document.createElement("td");

      // Define o conteúdo da célula como "✓" para etapas concluídas e "X" para não concluídas
      stepCell.innerText = activity.steps[index] ? "✓" : "X";
      stepCell.style.color = activity.steps[index] ? "green" : "red";

      const exist = activity.steps.find(
        (value) =>
          value.description.toLocaleLowerCase() === step.toLocaleLowerCase()
      );

      if (exist) {
        stepCell.innerText = exist.done ? "✓" : "X";
      } else {
        stepCell.innerText = "-";
      }

      // Se a etapa é a etapa atual (currentStep), destaca a célula
      if (index === activity.currentStep) {
        stepCell.style.backgroundColor = "yellow"; // Destaca a célula atual
      }

      row.appendChild(stepCell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

const equipmanetName = "T-28D-11X";

if (equipmanetName) {
  fetch(
    "https://raw.githubusercontent.com/lucassnts963/storage/refs/heads/master/acompanhamento/tanque/tanques.json"
  ) // Substitua pela URL pública do JSON
    .then((response) => response.json())
    .then((data) => {
      const equipmentData = data.equipments.find(
        (equip) => equip.tag === equipmanetName
      );

      const chartContainer = d3.select("#chart-container");

      if (equipmentData) {
        // Criação do gráfico de pizza para o equipment especificado
        const width = 300,
          height = 300,
          radius = Math.min(width, height) / 2;

        chartContainer
          .append("div")
          .attr("class", "chart-title")
          .text(equipmentData.tag);

        const svg = chartContainer
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const pie = d3
          .pie()
          .value((d) => 1)
          .sort(null);
        const arc = d3.arc().outerRadius(radius).innerRadius(0);
        const filledArc = d3
          .arc()
          .outerRadius((d) => d.data.value * radius)
          .innerRadius(0);

        // Fatias vazias
        svg
          .selectAll("path.slice")
          .data(pie(equipmentData.data))
          .enter()
          .append("path")
          .attr("class", "slice")
          .attr("d", arc)
          .attr("fill", "lightgray")
          .attr("stroke", "white")
          .attr("stroke-width", 2);

        // Fatias preenchidas com animação
        svg
          .selectAll("path.filled-slice")
          .data(pie(equipmentData.data))
          .enter()
          .append("path")
          .attr("class", "filled-slice")
          .attr("fill", (d) => d.data.color)
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .transition()
          .duration(1000)
          .delay((_, i) => i * 100)
          .attrTween("d", function (d) {
            const interpolateRadius = d3.interpolate(0, d.data.value * radius);
            return function (t) {
              return d3.arc().outerRadius(interpolateRadius(t)).innerRadius(0)(
                d
              );
            };
          });

        // Texto nas fatias
        svg
          .selectAll("text")
          .data(pie(equipmentData.data))
          .enter()
          .append("text")
          .attr("transform", (d) => `translate(${arc.centroid(d)})`)
          .text((d) => d.data.label)
          .attr("font-size", "32px")
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle");

        generateTable(equipmentData);
      } else {
        chartContainer.text("Equipamento não encontrado.");
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar os data:", error);
    });
} else {
  document.getElementById("chart-container").innerText =
    "Nenhum equipamento especificado.";
}
