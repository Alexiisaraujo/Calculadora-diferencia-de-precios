// Manejo pestañas
function mostrar(id, btn) {
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// Inicializar filtro y eventos
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('filtroFecha').value = today;
  filtrarRegistros();

  // Oferta tipo change
  document.getElementById('oferta_tipo').addEventListener('change', toggleOfertaBlocks);
  document.getElementById('predef').addEventListener('change', () => {
    // ajustar qty por defecto según predef
    const val = document.getElementById('predef').value;
    if (val === '3x2') document.getElementById('oferta_qty').value = 3;
    if (val === '4x3' || val === '4x2') document.getElementById('oferta_qty').value = 4;
    if (val === '2x50' || val === '2x20') document.getElementById('oferta_qty').value = 2;
  });
});

// ------------------ CALCULADORA (original) ------------------
function calcular() {
  const platelera = parseFloat(document.getElementById('platelera').value) || 0;
  const etiqueta = parseFloat(document.getElementById('etiqueta').value) || 0;
  const cantidad = parseFloat(document.getElementById('cantidad').value) || 1;
  const unidad = document.getElementById('unidad').value;

  let diferencia = 0;

  if (unidad === "unidad") {
    diferencia = (etiqueta - platelera) * cantidad;
  } else if (unidad === "kg") {
    // ahora la pestaña kilos hace esto — aquí mantenemos comportamiento por si el usuario activa "kg" en calculadora
    diferencia = (etiqueta * cantidad) - (platelera * cantidad);
  }

  const resultadoDiv = document.getElementById('resultado');
  resultadoDiv.innerHTML = `Diferencia: R$ ${diferencia.toFixed(2)}`;
  resultadoDiv.dataset.diferencia = diferencia.toFixed(2);
  // guardamos también detalle para registro
  resultadoDiv.dataset.detalle = JSON.stringify({
    tipo: 'calculadora',
    platelera: platelera,
    etiqueta: etiqueta,
    cantidad: cantidad,
    unidad: unidad,
    diferencia: diferencia.toFixed(2)
  });
}

// ------------------ OFERTAS ------------------
function toggleOfertaBlocks() {
  const tipo = document.getElementById('oferta_tipo').value;
  document.getElementById('predef_block').classList.toggle('hidden', tipo !== 'predef');
  document.getElementById('custom_block').classList.toggle('hidden', tipo !== 'custom');
  document.getElementById('nth_block').classList.toggle('hidden', tipo !== 'nthpct');
}

function calcularOferta() {
  const precio = parseFloat(document.getElementById('precio_oferta').value) || 0;
  const tipo = document.getElementById('oferta_tipo').value;
  const qty = parseInt(document.getElementById('oferta_qty').value) || 1;

  let total = 0;
  let descuento = 0;
  let detalle = '';

  if (tipo === 'predef') {
    const pre = document.getElementById('predef').value;
    switch(pre) {
      case '3x2':
        total = precio * 2;
        descuento = precio;
        detalle = `Lleve 3, pague 2 — Total por 3 unidades: R$${total.toFixed(2)} — Cada unidad: R$${(total/3).toFixed(2)}`;
        break;
      case '4x3':
        total = precio * 3;
        descuento = precio;
        detalle = `Lleve 4, pague 3 — Total por 4 unidades: R$${total.toFixed(2)} — Cada unidad: R$${(total/4).toFixed(2)}`;
        break;
      case '4x2':
        total = precio * 2;
        descuento = precio * 2;
        detalle = `Lleve 4, pague 2 — Total por 4 unidades: R$${total.toFixed(2)} — Cada unidad: R$${(total/4).toFixed(2)}`;
        break;
      case '2x50':
        const segunda = precio * 0.5;
        total = precio + segunda;
        descuento = precio * 0.5;
        detalle = `2ª unidad 50% — Unidad1: R$${precio.toFixed(2)} Unidad2: R$${segunda.toFixed(2)} — Total: R$${total.toFixed(2)}`;
        break;
      case '2x20':
        total = (precio * 2) * 0.8;
        descuento = (precio * 2) * 0.2;
        detalle = `Lleve 2 con 20% off total — Total: R$${total.toFixed(2)} — Cada unidad: R$${(total/2).toFixed(2)}`;
        break;
      default:
        // si no eligió predef, calculamos por qty sin oferta
        total = precio * qty;
        detalle = `Sin oferta seleccionada — Total simple por ${qty} unidades: R$${total.toFixed(2)}`;
    }
  } else if (tipo === 'custom') {
    const lleva = parseInt(document.getElementById('lleva_x').value) || 1;
    const paga = parseInt(document.getElementById('paga_y').value) || 1;
    // si el cliente realmente toma N unidades, debemos calcular cuántas "grupos" aplica o cómo aplicarlo.
    // simplificamos: calculamos el costo por un bloque de 'lleva' unidades (el cliente toma esa cantidad)
    // y proporcional para la 'qty' solicitada.
    // Costo por bloque:
    const costoBloque = precio * paga;
    // cuantos bloques completos hay en qty:
    const bloques = Math.floor(qty / lleva);
    const resto = qty % lleva;
    total = bloques * costoBloque + resto * precio;
    const precioSinOferta = precio * qty;
    descuento = precioSinOferta - total;
    detalle = `Personalizada: Lleva ${lleva} | Paga ${paga} — Total por ${qty} uds: R$${total.toFixed(2)} (Descuento: R$${descuento.toFixed(2)}) — Cada unidad promedio: R$${(total/qty).toFixed(2)}`;
  } else if (tipo === 'nthpct') {
    const n = parseInt(document.getElementById('nth_n').value) || 2;
    const pct = parseFloat(document.getElementById('nth_pct').value) || 0;
    // calculamos aplicando descuento al enésimo artículo que ocurra dentro de qty
    // ej: n=2, qty=3 aplica al segundo artículo
    let totalTemp = 0;
    let descuentoTemp = 0;
    for (let i = 1; i <= qty; i++) {
      if (i % n === 0) {
        const disc = precio * (pct/100);
        totalTemp += (precio - disc);
        descuentoTemp += disc;
      } else {
        totalTemp += precio;
      }
    }
    total = totalTemp;
    descuento = descuentoTemp;
    detalle = `Descuento ${pct}% cada ${n}ª unidad — Total por ${qty}: R$${total.toFixed(2)} — Descuento total: R$${descuento.toFixed(2)}`;
  }

  document.getElementById('resultado_oferta').innerHTML = detalle;
  document.getElementById('resultado_oferta').dataset.detalle = JSON.stringify({
    tipo: 'oferta',
    precio: precio,
    oferta_tipo: tipo,
    qty: qty,
    total: total.toFixed(2),
    descuento: descuento.toFixed(2),
    texto: detalle
  });
}

// ------------------ KILOS ------------------
function calcularKilos() {
  const peso = parseFloat(document.getElementById('peso').value) || 0;
  const etiquetaTotal = parseFloat(document.getElementById('precio_etiqueta_total').value) || 0;
  const kiloPlatelera = parseFloat(document.getElementById('kilo_platelera').value) || 0;

  if (peso <= 0 || kiloPlatelera <= 0) {
    document.getElementById('resultado_kilos').innerHTML = 'Ingrese peso y precio por kilo válidos';
    return;
  }

  const totalCorrecto = peso * kiloPlatelera; // lo que debería pagar según platelera
  const diferencia = etiquetaTotal - totalCorrecto; // lo que hay de más que pagó el cliente
  const detalle = `
    Precio etiqueta (total): R$${etiquetaTotal.toFixed(2)}<br>
    Peso: ${peso.toFixed(4)} kg<br>
    Kilo en platelera: R$${kiloPlatelera.toFixed(2)} /kg<br>
    Total correcto: R$${totalCorrecto.toFixed(2)}<br>
    <b>Diferencia (a descontar): R$${diferencia.toFixed(2)}</b>
  `;

  document.getElementById('resultado_kilos').innerHTML = detalle;
  document.getElementById('resultado_kilos').dataset.detalle = JSON.stringify({
    tipo: 'kilos',
    peso: peso,
    etiqueta_total: etiquetaTotal,
    kilo_platelera: kiloPlatelera,
    total_correcto: totalCorrecto.toFixed(2),
    diferencia: diferencia.toFixed(2)
  });
}

// ------------------ REGISTROS ------------------
// Registrar desde cualquiera de las pestañas: recibe tipo 'calculadora' | 'ofertas' | 'kilos'
function registrarDesde(origen) {
  let detalleData = null;
  let resultadoTexto = '';
  let pdv = '-';
  let operador = '-';
  let producto = '-';
  let observacion = '-';

  if (origen === 'calculadora') {
    const el = document.getElementById('resultado');
    if (!el.dataset.diferencia) return alert('Primero calcula la diferencia en la pestaña Calculadora');
    detalleData = JSON.parse(el.dataset.detalle || '{}');
    resultadoTexto = `Diferencia R$ ${el.dataset.diferencia}`;
    pdv = document.getElementById('pdv_calc').value || '-';
    operador = document.getElementById('operador_calc').value || '-';
    producto = document.getElementById('producto_calc').value || '-';
    observacion = document.getElementById('observacion_calc').value || '-';
  } else if (origen === 'ofertas') {
    const el = document.getElementById('resultado_oferta');
    if (!el.dataset.detalle) return alert('Primero calcula la oferta en la pestaña Ofertas');
    detalleData = JSON.parse(el.dataset.detalle || '{}');
    resultadoTexto = `Oferta: ${detalleData.texto || ('Total R$' + detalleData.total)}`;
    pdv = document.getElementById('pdv_oferta').value || '-';
    operador = document.getElementById('operador_oferta').value || '-';
    producto = document.getElementById('producto_oferta').value || '-';
    observacion = document.getElementById('observacion_oferta').value || '-';
  } else if (origen === 'kilos') {
    const el = document.getElementById('resultado_kilos');
    if (!el.dataset.detalle) return alert('Primero calcula la diferencia en Kilos');
    detalleData = JSON.parse(el.dataset.detalle || '{}');
    resultadoTexto = `Kilos - diferencia R$ ${detalleData.diferencia}`;
    pdv = document.getElementById('pdv_kilos').value || '-';
    operador = document.getElementById('operador_kilos').value || '-';
    producto = document.getElementById('producto_kilos').value || '-';
    observacion = document.getElementById('observacion_kilos').value || '-';
  }

  const fechaHora = new Date().toISOString(); // fecha + hora exacta
  const registro = {
    fechaHora,
    tipo: origen,
    pdv,
    operador,
    producto,
    resultado: resultadoTexto,
    detalle: detalleData,
    observacion
  };

  let registros = JSON.parse(localStorage.getItem('registros') || '[]');
  registros.push(registro);
  localStorage.setItem('registros', JSON.stringify(registros));

  // limpiar formularios/resultado
  if (origen === 'calculadora') {
    document.getElementById('resultado').innerHTML = '';
    document.getElementById('formCalc').reset();
  } else if (origen === 'ofertas') {
    document.getElementById('resultado_oferta').innerHTML = '';
    document.getElementById('formOfertas').reset();
  } else if (origen === 'kilos') {
    document.getElementById('resultado_kilos').innerHTML = '';
    document.getElementById('formKilos').reset();
  }

  filtrarRegistros();
  alert('Registro guardado ✅');
}

// Filtrar registros por fecha (YYYY-MM-DD)
function filtrarRegistros() {
  const fechaSeleccionada = document.getElementById('filtroFecha').value;
  const tbody = document.querySelector('#tablaRegistros tbody');
  tbody.innerHTML = '';

  const registros = JSON.parse(localStorage.getItem('registros') || '[]');
  // si no hay fechaSeleccionada mostrar todo; pero por defecto usamos la fecha actual
  const filtrados = registros.filter(r => {
    if(!fechaSeleccionada) return true;
    return r.fechaHora.startsWith(fechaSeleccionada);
  });

  filtrados.forEach((r, index) => {
    const tr = document.createElement('tr');
    const btnId = `del-${index}-${r.fechaHora.replace(/[:.]/g,'')}`;
    tr.innerHTML = `
      <td>${formatoFechaHora(r.fechaHora)}</td>
      <td>${r.tipo}</td>
      <td>${escapeHtml(r.pdv)}</td>
      <td>${escapeHtml(r.operador)}</td>
      <td>${escapeHtml(r.producto)}</td>
      <td class="small">${escapeHtml(r.resultado)}</td>
      <td>${escapeHtml(r.observacion)}</td>
      <td><button onclick="eliminarRegistro(${index})">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Eliminar registro por idx (usa el array actual)
function eliminarRegistro(idx) {
  let registros = JSON.parse(localStorage.getItem('registros') || '[]');
  if (!registros[idx]) return;
  if (!confirm('¿Eliminar registro?')) return;
  registros.splice(idx, 1);
  localStorage.setItem('registros', JSON.stringify(registros));
  filtrarRegistros();
}

// Borrar todos
function borrarTodo() {
  if(confirm('¿Deseas borrar todos los registros?')) {
    localStorage.removeItem('registros');
    filtrarRegistros();
  }
}

// Utilitarios
function formatoFechaHora(iso) {
  const d = new Date(iso);
  return d.toLocaleString(); // formato local con fecha y hora
}

function escapeHtml(text) {
  if (!text && text !== 0) return '-';
  return String(text)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}

// Actualizar tabla al cambiar fecha
document.getElementById('filtroFecha').addEventListener('change', filtrarRegistros);

