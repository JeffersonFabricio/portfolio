/* =========================================================================
   Skill Graph — grafo de conhecimento estilo Obsidian (D3 force simulation)
   Clusters por categoria + arestas entre skills relacionadas.
   Animado, arrastável, hover destaca conexões. Zero-build (D3 via CDN).
   ========================================================================= */
(function () {
  'use strict';

  function init() {
    var host = document.getElementById('skill-graph');
    if (!host || typeof d3 === 'undefined') return;

    // ---- paleta por categoria (combina com o tema do template) ----
    var CAT = {
      tech:     { label: 'Tecnologias',          color: '#18d26e' },
      cloud:    { label: 'Cloud',                color: '#ff8a3d' },
      arch:     { label: 'Arquitetura',          color: '#1bb3c4' },
      design:   { label: 'Princípios de design', color: '#4d8dff' },
      testes:   { label: 'Testes',               color: '#2dd4bf' },
      security: { label: 'Segurança',            color: '#f0556b' },
      practice: { label: 'Práticas',             color: '#b98bff' },
      ai:       { label: 'IA',                   color: '#ffb454' }
    };

    // ---- nós: categorias (cluster) + skills ----
    var nodes = [
      // categorias
      { id: 'tech', cat: 'tech', kind: 'cat' },
      { id: 'cloud', cat: 'cloud', kind: 'cat' },
      { id: 'arch', cat: 'arch', kind: 'cat' },
      { id: 'design', cat: 'design', kind: 'cat' },
      { id: 'testes', cat: 'testes', kind: 'cat' },
      { id: 'security', cat: 'security', kind: 'cat' },
      { id: 'practice', cat: 'practice', kind: 'cat' },
      { id: 'ai', cat: 'ai', kind: 'cat' },
      // tecnologias
      { id: 'Java', cat: 'tech' }, { id: 'Spring', cat: 'tech' },
      { id: 'Angular', cat: 'tech' }, { id: 'Flutter', cat: 'tech' },
      { id: 'Node', cat: 'tech' }, { id: 'TypeScript', cat: 'tech' },
      { id: 'SQL', cat: 'tech' }, { id: 'Databricks', cat: 'tech' },
      // cloud & infra
      { id: 'AWS', cat: 'cloud' }, { id: 'Azure', cat: 'cloud' },
      { id: 'Bedrock', cat: 'cloud' }, { id: 'ECS', cat: 'cloud' },
      { id: 'Fargate', cat: 'cloud' }, { id: 'Docker', cat: 'cloud' },
      { id: 'Terraform', cat: 'cloud' },
      // arquitetura & padrões
      { id: 'Microserviços', cat: 'arch' }, { id: 'CQRS', cat: 'arch' },
      { id: 'Vertical Slice', cat: 'arch' }, { id: 'MVC', cat: 'arch' },
      { id: 'Serverless', cat: 'arch' }, { id: 'Webhook', cat: 'arch' },
      { id: 'Clean Arch', cat: 'arch' },
      // princípios
      { id: 'SOLID', cat: 'design' }, { id: 'DRY', cat: 'design' },
      { id: 'KISS', cat: 'design' }, { id: 'YAGNI', cat: 'design' },
      // testes
      { id: 'Unitários', cat: 'testes' }, { id: 'Integração', cat: 'testes' },
      { id: 'Postman', cat: 'testes' }, { id: 'E2E', cat: 'testes' },
      { id: 'Playwright', cat: 'testes' }, { id: 'Bancada', cat: 'testes' },
      { id: 'Carga', cat: 'testes' },
      // segurança
      { id: 'SAST', cat: 'security' }, { id: 'DAST', cat: 'security' },
      { id: 'OWASP Top 10', cat: 'security' },
      // práticas
      { id: 'TDD', cat: 'practice' }, { id: 'SDD', cat: 'practice' },
      { id: 'CI/CD', cat: 'practice' }, { id: 'DevOps', cat: 'practice' },
      { id: 'Code review', cat: 'practice' }, { id: 'Negócio', cat: 'practice' },
      { id: 'Pair prog.', cat: 'practice' }, { id: 'Mentoria', cat: 'practice' },
      // IA
      { id: 'Claude', cat: 'ai' }, { id: 'Agentes', cat: 'ai' },
      { id: 'RAG', cat: 'ai' }, { id: 'MCP', cat: 'ai' },
      { id: 'LLMs', cat: 'ai' }, { id: 'Multi Agentes', cat: 'ai' },
      { id: 'Embeddings', cat: 'ai' }
    ];

    // ---- arestas: skill → sua categoria (cluster) ----
    var links = nodes
      .filter(function (n) { return n.kind !== 'cat'; })
      .map(function (n) { return { source: n.id, target: n.cat, kind: 'cluster' }; });

    // ---- arestas extras: relações reais entre skills ----
    var rel = [
      ['Java', 'Spring'], ['Spring', 'Clean Arch'], ['Angular', 'TypeScript'],
      ['Node', 'TypeScript'], ['Flutter', 'Clean Arch'],
      ['SOLID', 'Clean Arch'], ['SOLID', 'DRY'], ['DRY', 'KISS'], ['KISS', 'YAGNI'],
      ['TDD', 'Clean Arch'], ['TDD', 'CI/CD'], ['CI/CD', 'DevOps'],
      ['DevOps', 'AWS'], ['DevOps', 'Azure'], ['SDD', 'TDD'],
      ['Claude', 'Code review'], ['Claude', 'Agentes'], ['Agentes', 'RAG'],
      ['SDD', 'Claude'],
      ['RAG', 'Databricks'], ['AWS', 'Databricks'], ['Azure', 'Databricks'],
      // arquitetura
      ['Microserviços', 'CQRS'], ['Microserviços', 'Serverless'],
      ['Microserviços', 'Webhook'], ['CQRS', 'Clean Arch'],
      ['Vertical Slice', 'Clean Arch'], ['MVC', 'Clean Arch'],
      ['Serverless', 'AWS'], ['Serverless', 'Azure'], ['Bedrock', 'AWS'],
      ['Bedrock', 'Agentes'], ['Microserviços', 'Spring'],
      ['Negócio', 'CQRS'], ['Negócio', 'Code review'],
      ['Mentoria', 'Pair prog.'], ['Mentoria', 'Code review'], ['Pair prog.', 'TDD'],
      // cloud & infra
      ['Docker', 'ECS'], ['ECS', 'Fargate'], ['Fargate', 'AWS'], ['ECS', 'AWS'],
      ['Docker', 'DevOps'], ['Terraform', 'AWS'], ['Terraform', 'Azure'],
      ['Terraform', 'DevOps'], ['Serverless', 'Fargate'],
      // testes
      ['Unitários', 'TDD'], ['Unitários', 'CI/CD'], ['E2E', 'Playwright'],
      ['E2E', 'CI/CD'], ['Postman', 'Webhook'], ['Playwright', 'Angular'],
      ['Integração', 'Unitários'], ['Integração', 'Microserviços'],
      ['Postman', 'Integração'], ['Bancada', 'Integração'],
      ['Carga', 'DevOps'], ['Carga', 'E2E'],
      // segurança
      ['SAST', 'CI/CD'], ['DAST', 'CI/CD'], ['SAST', 'OWASP Top 10'],
      ['DAST', 'OWASP Top 10'], ['OWASP Top 10', 'Code review'], ['DAST', 'E2E'],
      // IA
      ['MCP', 'Claude'], ['MCP', 'Agentes'], ['Multi Agentes', 'Agentes'],
      ['Embeddings', 'RAG'], ['LLMs', 'Claude'], ['LLMs', 'Bedrock'],
      ['Multi Agentes', 'LLMs'], ['Embeddings', 'Databricks']
    ];
    rel.forEach(function (r) { links.push({ source: r[0], target: r[1], kind: 'rel' }); });

    // índice de vizinhança p/ hover
    var neighbors = {};
    nodes.forEach(function (n) { neighbors[n.id] = new Set([n.id]); });
    links.forEach(function (l) {
      neighbors[l.source].add(l.target);
      neighbors[l.target].add(l.source);
    });

    // ---- dimensões ----
    var W = host.clientWidth || 720;
    var H = Math.max(520, Math.min(640, W * 0.74));

    var svg = d3.select(host).append('svg')
      .attr('width', '100%').attr('height', H)
      .attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('display', 'block').style('cursor', 'grab');

    var g = svg.append('g');

    var link = g.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', function (d) { return d.kind === 'cluster' ? '#cfd6dd' : '#e2e7ec'; })
      .attr('stroke-width', function (d) { return d.kind === 'cluster' ? 1.4 : 1; })
      .attr('stroke-opacity', function (d) { return d.kind === 'cluster' ? 0.7 : 0.45; });

    var node = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragStart).on('drag', dragged).on('end', dragEnd));

    node.append('circle')
      .attr('r', function (d) { return d.kind === 'cat' ? 13 : 7; })
      .attr('fill', function (d) { return d.kind === 'cat' ? CAT[d.cat].color : '#ffffff'; })
      .attr('stroke', function (d) { return CAT[d.cat].color; })
      .attr('stroke-width', function (d) { return d.kind === 'cat' ? 2.5 : 2; });

    node.append('text')
      .text(function (d) { return d.kind === 'cat' ? CAT[d.cat].label : d.id; })
      .attr('x', function (d) { return d.kind === 'cat' ? 0 : 11; })
      .attr('y', function (d) { return d.kind === 'cat' ? 26 : 4; })
      .attr('text-anchor', function (d) { return d.kind === 'cat' ? 'middle' : 'start'; })
      .attr('font-family', "'Poppins', sans-serif")
      .attr('font-size', function (d) { return d.kind === 'cat' ? '12px' : '11px'; })
      .attr('font-weight', function (d) { return d.kind === 'cat' ? 700 : 500; })
      .attr('fill', function (d) { return d.kind === 'cat' ? CAT[d.cat].color : '#45505b'; });

    // ---- força ----
    // âncoras: distribui os clusters num anel ao redor do centro, bem espalhados
    var catKeys = Object.keys(CAT);
    var anchors = {};
    function computeAnchors() {
      var cx = W / 2, cy = H / 2;
      var rx = W * 0.36, ry = H * 0.34; // raio do anel (elíptico p/ aproveitar a largura)
      catKeys.forEach(function (k, i) {
        var a = (i / catKeys.length) * 2 * Math.PI - Math.PI / 2; // começa no topo
        anchors[k] = { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
      });
    }
    computeAnchors();

    var sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(function (d) { return d.id; })
        .distance(function (d) { return d.kind === 'cluster' ? 46 : 80; })
        .strength(function (d) { return d.kind === 'cluster' ? 0.6 : 0.05; }))
      .force('charge', d3.forceManyBody().strength(function (d) { return d.kind === 'cat' ? -260 : -150; }))
      // puxa cada nó para a âncora da sua categoria → clusters espalhados, nada colado no canto
      .force('x', d3.forceX(function (d) { return anchors[d.cat].x; }).strength(function (d) { return d.kind === 'cat' ? 0.55 : 0.32; }))
      .force('y', d3.forceY(function (d) { return anchors[d.cat].y; }).strength(function (d) { return d.kind === 'cat' ? 0.55 : 0.32; }))
      .force('collide', d3.forceCollide().radius(function (d) { return d.kind === 'cat' ? 40 : 26; }).strength(0.9))
      .on('tick', tick);

    function tick() {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });
      node.attr('transform', function (d) {
        d.x = Math.max(20, Math.min(W - 20, d.x));
        d.y = Math.max(16, Math.min(H - 16, d.y));
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    }

    // ---- hover: destaca o nó e suas conexões ----
    node.on('mouseenter', function (event, d) {
      var nb = neighbors[d.id];
      node.style('opacity', function (o) { return nb.has(o.id) ? 1 : 0.15; });
      link.style('opacity', function (l) {
        return (l.source.id === d.id || l.target.id === d.id) ? 0.95 : 0.04;
      }).attr('stroke', function (l) {
        return (l.source.id === d.id || l.target.id === d.id) ? CAT[d.cat].color : '#e2e7ec';
      });
    }).on('mouseleave', function () {
      node.style('opacity', 1);
      link.style('opacity', function (l) { return l.kind === 'cluster' ? 0.7 : 0.45; })
        .attr('stroke', function (l) { return l.kind === 'cluster' ? '#cfd6dd' : '#e2e7ec'; });
    });

    function dragStart(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y; svg.style('cursor', 'grabbing');
    }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragEnd(event, d) {
      if (!event.active) sim.alphaTarget(0);
      d.fx = null; d.fy = null; svg.style('cursor', 'grab');
    }

    // recalcula âncoras/viewBox em resize
    var ro = new ResizeObserver(function () {
      var nw = host.clientWidth || W;
      if (Math.abs(nw - W) < 8) return;
      W = nw;
      H = Math.max(520, Math.min(640, W * 0.74));
      svg.attr('height', H).attr('viewBox', '0 0 ' + W + ' ' + H);
      computeAnchors();
      sim.alpha(0.4).restart();
    });
    ro.observe(host);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
