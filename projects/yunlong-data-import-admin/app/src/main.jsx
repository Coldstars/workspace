import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const SCHOOL_SEEDS = [
  ['云龙区实验小学', 1248, 4],
  ['云龙区青年路小学', 1096, 2],
  ['云龙区解放路小学', 982, 0],
  ['云龙区民富园小学', 1163, 5],
  ['云龙区潘塘中心小学', 873, 1],
  ['云龙区汉景小学', 928, 0],
  ['云龙区翠屏山小学', 764, 3],
  ['云龙区新元小学', 1018, 2],
  ['云龙区王杰中学', 1352, 7, true],
  ['云龙区津浦西路小学', 692, 0],
  ['云龙区骆驼山小学', 806, 6],
  ['云龙区大龙湖小学', 1057, 1]
];

const STUDENT_NAMES = ['张宇航', '李欣然', '王若辰', '赵一鸣', '陈思琪', '刘子涵', '周明轩', '吴佳怡'];
const ISSUE_TYPES = [
  ['身份证异常', '学生身份证', '320303********12X', '核对身份证位数和校验位，修正后重新导入。'],
  ['班级异常', '班级', '七年级-待分班', '补充标准班级名称，例如“七年级 3 班”。'],
  ['姓名缺失', '姓名', '空', '补充学生姓名，或删除无效空行。'],
  ['学校无法识别', '学校名称', '文件名与学校库不一致', '按学校标准名称重命名文件，或在学校库中维护别名。']
];

function nowTime() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function makeBatchNo() {
  const date = new Date();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `YL-${date.getFullYear()}${mm}${dd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function createFileJob(seed, index, source = '检测机构交付') {
  const [school, rowCount, issueCount, fatal] = seed;
  return {
    id: source === '检测机构交付' ? `seed-${index}` : `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    school,
    fileName: `${school}学生基础信息表.xlsx`,
    rowCount,
    issuePlan: issueCount,
    fatal: Boolean(fatal),
    status: 'ready',
    progress: 0,
    successRows: 0,
    issueCount: 0,
    uploadedAt: source,
    operationTime: '',
    message: '待导入'
  };
}

function initialFiles() {
  return SCHOOL_SEEDS.map((seed, index) => createFileJob(seed, index));
}


function makeProblemRows(file) {
  const rows = [];
  for (let index = 0; index < (file.issuePlan || 0); index += 1) {
    const issue = ISSUE_TYPES[(index + file.school.length) % ISSUE_TYPES.length];
    rows.push({
      id: `${file.id}-issue-${index}`,
      fileId: file.id,
      school: file.school,
      rowNo: 18 + index * 27,
      studentName: issue[0] === '姓名缺失' ? '待补充' : STUDENT_NAMES[(index + file.school.length) % STUDENT_NAMES.length],
      grade: ['一年级', '三年级', '五年级', '七年级'][index % 4],
      className: issue[0] === '班级异常' ? '待分班' : `${(index % 6) + 1} 班`,
      type: issue[0],
      field: issue[1],
      value: issue[2],
      suggestion: issue[3],
      status: '待修正'
    });
  }
  return rows;
}

function makeFatalProblem(file) {
  return {
    id: `${file.id}-fatal`,
    fileId: file.id,
    school: file.school,
    rowNo: '-',
    studentName: '-',
    grade: '-',
    className: '-',
    type: '文件结构异常',
    field: '学生身份证',
    value: '缺少必填列',
    suggestion: '按模板补充“学生身份证”列后重新导入。',
    status: '待修正'
  };
}

function createBootstrapState() {
  const params = new URLSearchParams(window.location.search);
  const scenario = params.get('scenario');
  const files = scenario === 'empty' ? [] : initialFiles();
  let problems = [];
  if (scenario === 'done') {
    files.forEach((file) => {
      if (file.fatal) {
        file.status = 'failed';
        file.progress = 100;
        file.successRows = 0;
        file.issueCount = 1;
        file.operationTime = nowTime();
        file.message = '文件结构异常：缺少学生身份证列';
        problems.push(makeFatalProblem(file));
        return;
      }
      const rows = makeProblemRows(file);
      file.status = rows.length ? 'partial' : 'success';
      file.progress = 100;
      file.successRows = Math.max(0, file.rowCount - rows.length);
      file.issueCount = rows.length;
      file.operationTime = nowTime();
      file.message = rows.length ? `导入完成，发现 ${rows.length} 条问题数据` : '导入完成，未发现问题数据';
      problems = problems.concat(rows);
    });
  }
  return {
    activePage: params.get('page') === 'history' ? 'import-history' : 'data-import',
    files,
    problems
  };
}

const BOOTSTRAP_STATE = createBootstrapState();

function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN');
}

function displayStatus(status) {
  if (status === 'success') return '成功';
  if (status === 'partial' || status === 'failed') return '异常';
  return '待导入';
}

function statusClass(status) {
  if (status === 'success') return 'success';
  if (status === 'partial' || status === 'failed') return 'exception';
  return 'ready';
}

function progressClass(status) {
  if (status === 'success') return 'success';
  if (status === 'partial' || status === 'failed') return 'warning';
  return 'primary';
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function App() {
  const [activePage, setActivePage] = useState(BOOTSTRAP_STATE.activePage);
  const [batchNo, setBatchNo] = useState(makeBatchNo());
  const [fileJobs, setFileJobs] = useState(BOOTSTRAP_STATE.files);
  const [selectedIds, setSelectedIds] = useState(() => BOOTSTRAP_STATE.files.map((item) => item.id));
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [problemRows, setProblemRows] = useState(BOOTSTRAP_STATE.problems);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const totals = useMemo(() => {
    const totalRows = fileJobs.reduce((sum, item) => sum + item.rowCount, 0);
    const importedRows = fileJobs.reduce((sum, item) => sum + item.successRows, 0);
    const successFiles = fileJobs.filter((item) => item.status === 'success');
    const exceptionFiles = fileJobs.filter((item) => item.status === 'partial' || item.status === 'failed');
    const pendingFiles = fileJobs.filter((item) => !['success', 'partial', 'failed'].includes(item.status));
    return {
      totalRows,
      importedRows,
      successFiles,
      exceptionFiles,
      pendingFiles,
      successRate: totalRows ? Math.round((importedRows / totalRows) * 100) : 0
    };
  }, [fileJobs]);

  const selectableIds = useMemo(
    () => fileJobs.filter((item) => item.status !== 'success').map((item) => item.id),
    [fileJobs]
  );

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  const visibleFiles = useMemo(() => {
    const term = keyword.trim();
    return fileJobs.filter((item) => {
      const hitKeyword = !term || item.school.includes(term) || item.fileName.includes(term);
      const hitStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ready' && !['success', 'partial', 'failed'].includes(item.status)) ||
        (statusFilter === 'success' && item.status === 'success') ||
        (statusFilter === 'exception' && ['partial', 'failed'].includes(item.status));
      return hitKeyword && hitStatus;
    });
  }, [fileJobs, keyword, statusFilter]);

  const historyFiles = useMemo(
    () => fileJobs.filter((item) => ['success', 'partial', 'failed'].includes(item.status)),
    [fileJobs]
  );

  const activePageName = activePage === 'import-history' ? '导入历史' : '表格导入';
  function showToast(type, message) {
    setToast({ id: Date.now(), type, message });
    window.setTimeout(() => setToast(null), 2400);
  }

  function updateFile(id, patch) {
    setFileJobs((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function toggleSelectAll(checked) {
    setSelectedIds(checked ? selectableIds : []);
  }

  function addLocalFiles(files) {
    if (!files.length || isImporting) return;
    const jobs = files.map((file, index) => {
      const cleanName = file.name.replace(/\.(xlsx|xls|csv)$/i, '');
      const school = cleanName.replace(/学生基础信息表|学生信息表|基础信息|数据表/g, '') || `云龙区新增学校${index + 1}`;
      const rowCount = 680 + ((file.name.length + index * 137) % 780);
      const issueCount = (file.name.length + index) % 5;
      return { ...createFileJob([school, rowCount, issueCount], index, '本地选择'), fileName: file.name };
    });
    setFileJobs((prev) => [...prev, ...jobs]);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...jobs.map((item) => item.id)])));
    showToast('success', `已追加 ${jobs.length} 个文件`);
  }

  function handleFileSelect(event) {
    addLocalFiles(Array.from(event.target.files || []));
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    addLocalFiles(Array.from(event.dataTransfer.files || []));
  }

  function createProblems(file) {
    return makeProblemRows(file);
  }

  function createProblemsLegacy(file) {
    const rows = [];
    for (let index = 0; index < (file.issuePlan || 0); index += 1) {
      const issue = ISSUE_TYPES[(index + file.school.length) % ISSUE_TYPES.length];
      rows.push({
        id: `${file.id}-issue-${index}`,
        fileId: file.id,
        school: file.school,
        rowNo: 18 + index * 27,
        studentName: issue[0] === '姓名缺失' ? '待补充' : STUDENT_NAMES[(index + file.school.length) % STUDENT_NAMES.length],
        grade: ['一年级', '三年级', '五年级', '七年级'][index % 4],
        className: issue[0] === '班级异常' ? '待分班' : `${(index % 6) + 1} 班`,
        type: issue[0],
        field: issue[1],
        value: issue[2],
        suggestion: issue[3],
        status: '待修正'
      });
    }
    return rows;
  }

  function createFatalProblem(file) {
    return makeFatalProblem(file);
  }

  function createFatalProblemLegacy(file) {
    return {
      id: `${file.id}-fatal`,
      fileId: file.id,
      school: file.school,
      rowNo: '-',
      studentName: '-',
      grade: '-',
      className: '-',
      type: '文件结构异常',
      field: '学生身份证',
      value: '缺少必填列',
      suggestion: '按模板补充“学生身份证”列后重新导入。',
      status: '待修正'
    };
  }

  async function processFiles(targets) {
    if (!targets.length || isImporting) return;
    setIsImporting(true);
    const nextBatchNo = makeBatchNo();
    setBatchNo(nextBatchNo);
    const targetIds = new Set(targets.map((item) => item.id));
    setProblemRows((prev) => prev.filter((row) => !targetIds.has(row.fileId)));
    setFileJobs((prev) => prev.map((item) => targetIds.has(item.id)
      ? { ...item, status: 'queued', progress: 0, successRows: 0, issueCount: 0, operationTime: '', message: '排队等待导入' }
      : item
    ));

    for (const file of targets) {
      updateFile(file.id, { status: 'matching', progress: 8, message: '正在校验文件字段' });
      await wait(280);
      updateFile(file.id, { progress: 24 });
      await wait(220);
      updateFile(file.id, { status: 'importing', message: '正在写入学生基础数据' });
      for (const percent of [38, 52, 68, 83]) {
        updateFile(file.id, { progress: percent });
        await wait(120);
      }

      if (file.fatal) {
        const problem = createFatalProblem(file);
        setProblemRows((prev) => [...prev, problem]);
        updateFile(file.id, {
          status: 'failed',
          progress: 100,
          successRows: 0,
          issueCount: 1,
          operationTime: nowTime(),
          message: '文件结构异常：缺少学生身份证列'
        });
      } else {
        const problems = createProblems(file);
        setProblemRows((prev) => [...prev, ...problems]);
        updateFile(file.id, {
          status: problems.length ? 'partial' : 'success',
          progress: 100,
          successRows: Math.max(0, file.rowCount - problems.length),
          issueCount: problems.length,
          operationTime: nowTime(),
          message: problems.length ? `导入完成，发现 ${problems.length} 条问题数据` : '导入完成，未发现问题数据'
        });
      }
      await wait(120);
    }

    setIsImporting(false);
    setSelectedIds([]);
    showToast('success', '导入批次完成，可查看结果或导出问题数据');
  }

  function startImport() {
    const targets = fileJobs.filter((item) => item.status === 'ready');
    if (!targets.length) {
      showToast('info', '当前没有需要导入的文件');
      return;
    }
    processFiles(targets);
  }

  function startSingleImport(file) {
    if (file.status === 'success') return;
    processFiles([file]);
  }

  function deleteFile(file) {
    if (isImporting) return;
    setFileJobs((prev) => prev.filter((item) => item.id !== file.id));
    setProblemRows((prev) => prev.filter((item) => item.fileId !== file.id));
    setSelectedIds((prev) => prev.filter((id) => id !== file.id));
    showToast('success', '文件已删除');
  }

  function exportProblemRows(fileId) {
    const rows = fileId ? problemRows.filter((row) => row.fileId === fileId) : problemRows;
    if (!rows.length) {
      showToast('warning', '当前没有可导出的问题数据');
      return;
    }
    const headers = ['学校', '行号', '学生姓名', '年级', '班级', '问题类型', '问题字段', '当前值', '处理建议', '状态'];
    const lines = rows.map((row) => [row.school, row.rowNo, row.studentName, row.grade, row.className, row.type, row.field, row.value, row.suggestion, row.status]);
    const csv = '\ufeff' + [headers, ...lines].map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const targetFile = fileId ? fileJobs.find((item) => item.id === fileId) : null;
    link.href = url;
    link.download = `${batchNo}-${targetFile ? targetFile.school : '全部'}问题数据导出.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', `已导出 ${rows.length} 条问题数据`);
  }

  function resetDemo() {
    if (isImporting) return;
    const nextFiles = initialFiles();
    setBatchNo(makeBatchNo());
    setFileJobs(nextFiles);
    setSelectedIds(nextFiles.map((item) => item.id));
    setKeyword('');
    setStatusFilter('all');
    setProblemRows([]);
    setActivePage('data-import');
    showToast('success', '演示已重置');
  }

  return (
    <div className="admin-layout">
      <Sidebar activePage={activePage} onChange={setActivePage} />
      <section className="main-container">
        <Topbar isImporting={isImporting} onReset={resetDemo} />
        <main className="content-main">
          <nav className="breadcrumb" aria-label="面包屑"><span>数据管理</span><b>/</b><span>{activePageName}</span></nav>
          {activePage === 'data-import' ? (
            <ImportPage
              fileJobs={fileJobs}
              visibleFiles={visibleFiles}
              totals={totals}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              allSelected={allSelected}
              toggleSelectAll={toggleSelectAll}
              keyword={keyword}
              setKeyword={setKeyword}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              isImporting={isImporting}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              handleDrop={handleDrop}
              startImport={startImport}
              startSingleImport={startSingleImport}
              deleteFile={deleteFile}
              exportProblemRows={exportProblemRows}
              problemRows={problemRows}
            />
          ) : (
            <HistoryPage historyFiles={historyFiles} />
          )}
        </main>
      </section>
      {toast && <Toast toast={toast} />}
    </div>
  );
}

function Sidebar({ activePage, onChange }) {
  return (
    <aside className="app-aside">
      <div className="brand">
        <span className="brand-mark">云</span>
        <div>
          <p className="brand-title">教育数据治理平台</p>
          <p className="brand-subtitle">Yunlong Data Admin</p>
        </div>
      </div>
      <nav className="side-menu" aria-label="主导航">
        <button className={activePage === 'data-import' ? 'active' : ''} onClick={() => onChange('data-import')}>表格导入</button>
        <button className={activePage === 'import-history' ? 'active' : ''} onClick={() => onChange('import-history')}>导入历史</button>
      </nav>
    </aside>
  );
}

function Topbar({ isImporting, onReset }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <h1>云龙区学校数据表格导入平台</h1>
        <span className="tag info">演示环境</span>
      </div>
      <div className="header-right">
        <span className="org-text">当前机构：云龙区教育局</span>
        <button className="button button-plain" disabled={isImporting} onClick={onReset}>重置演示</button>
      </div>
    </header>
  );
}

function ImportPage(props) {
  const {
    fileJobs, visibleFiles, totals, selectedIds, setSelectedIds, allSelected, toggleSelectAll, keyword, setKeyword,
    statusFilter, setStatusFilter, isImporting, isDragging, setIsDragging, fileInputRef, handleFileSelect, handleDrop,
    startImport, startSingleImport, deleteFile, exportProblemRows, problemRows
  } = props;

  return (
    <div className="page-body import-page">
      <section className="stat-row">
        <StatCard title="文件数量" value={fileJobs.length} note={`已选中 ${selectedIds.length} 个文件`} label="学校维度" />
        <div className="stat-main-grid">
          <StatCard title="总记录数" value={totals.totalRows} note="按文件内学生行数估算" label="学生" />
          <StatCard title="已入库" value={totals.importedRows} note={`当前成功率 ${totals.successRate}%`} label="成功" tone="success" />
          <StatCard title="问题数据" value={problemRows.length} note="包含身份证、班级、姓名等异常" label="可导出" tone="warning" />
        </div>
      </section>

      <section className="import-workspace">
        <article className="section-card upload-card">
          <header className="section-header">
            <div><h2>文件选择</h2><p>选择检测机构提供的学校表格文件，文件会进入下方导入队列。</p></div>
          </header>
          <div
            className={`upload-zone ${isDragging ? 'is-dragging' : ''}`}
            onClick={() => !isImporting && fileInputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
          >
            <span className="upload-icon">+</span>
            <h3>点击或拖拽学校表格文件到这里</h3>
            <p>支持 .xlsx / .xls / .csv。演示页不会读取真实文件内容，会按文件名生成 mock 导入结果。</p>
            <button className="button button-primary ghost" disabled={isImporting}>选择文件</button>
            <input ref={fileInputRef} type="file" multiple accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
          </div>
          <div className="hint-list">
            <span>建议文件命名：学校名称_检测日期.xlsx</span>
            <span>系统优先识别：身份证、年级、班级、姓名</span>
            <span>异常文件可在队列中单独导出问题数据</span>
            <span>适合检测机构分学校批量交付数据</span>
          </div>
        </article>

        <article className="section-card queue-card">
          <header className="section-header">
            <div><h2>文件导入队列</h2><p>队列中的文件可单独开始导入，也可一次性全部开始。</p></div>
            <div className="card-actions">
              <button className="button" disabled={!problemRows.length || isImporting} onClick={() => exportProblemRows()}>批量导出问题数据</button>
              <button className="button button-primary" disabled={isImporting || !fileJobs.some((item) => item.status === 'ready')} onClick={startImport}>{isImporting ? '导入中...' : '全部开始'}</button>
            </div>
          </header>
          <div className="table-tools">
            <div className="tool-left">
              <label className="checkbox-line"><input type="checkbox" checked={allSelected} disabled={isImporting || !fileJobs.length} onChange={(event) => toggleSelectAll(event.target.checked)} /> 全选</label>
              <span className="tag info">待导入 {totals.pendingFiles.length}</span>
              <span className="tag success">成功 {totals.successFiles.length}</span>
              <span className="tag warning">异常 {totals.exceptionFiles.length}</span>
            </div>
            <div className="tool-right">
              <input className="control" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索学校或文件名" />
              <select className="control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">全部状态</option>
                <option value="ready">待导入</option>
                <option value="success">成功</option>
                <option value="exception">异常</option>
              </select>
            </div>
          </div>
          <FileTable
            rows={visibleFiles}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            isImporting={isImporting}
            startSingleImport={startSingleImport}
            deleteFile={deleteFile}
            exportProblemRows={exportProblemRows}
            emptyText={fileJobs.length ? '暂无匹配文件，请调整搜索或状态筛选' : '暂无文件，请先选择学校表格'}
          />
        </article>
      </section>
    </div>
  );
}

function StatCard({ title, value, note, label, tone = 'info' }) {
  return (
    <article className="stat-card">
      <div className="stat-label"><span>{title}</span><span className={`tag ${tone}`}>{label}</span></div>
      <strong>{formatNumber(value)}</strong>
      <p>{note}</p>
    </article>
  );
}

function FileTable({ rows, selectedIds, setSelectedIds, isImporting, startSingleImport, deleteFile, exportProblemRows, emptyText }) {
  function toggleRow(id, checked) {
    setSelectedIds((prev) => checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id));
  }

  return (
    <div className="table-wrap queue-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="select-col"></th>
            <th>学校文件</th>
            <th>状态</th>
            <th>进度</th>
            <th>导入结果</th>
            <th>说明</th>
            <th className="action-col">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.id}>
              <td><input type="checkbox" checked={selectedIds.includes(row.id)} disabled={isImporting || row.status === 'success'} onChange={(event) => toggleRow(row.id, event.target.checked)} /></td>
              <td><FileCell row={row} /></td>
              <td><StatusPill status={row.status} /></td>
              <td><ProgressBar value={row.progress} status={row.status} /></td>
              <td><span>{formatNumber(row.successRows)} 成功</span><span className="muted"> / </span><span className={row.issueCount ? 'issue-count' : 'muted'}>{row.issueCount} 问题</span></td>
              <td className="message-cell" title={row.message}>{row.message}</td>
              <td className="row-actions">
                <button disabled={isImporting || row.status === 'success'} onClick={() => startSingleImport(row)}>开始导入</button>
                <button disabled={!row.issueCount || isImporting} onClick={() => exportProblemRows(row.id)}>导出问题数据</button>
                <button className="danger-link" disabled={isImporting} onClick={() => deleteFile(row)}>删除</button>
              </td>
            </tr>
          )) : (
            <tr><td className="empty-cell" colSpan="7">{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function HistoryPage({ historyFiles }) {
  return (
    <div className="page-body history-page">
      <article className="section-card history-card">
        <header className="section-header">
          <div><h2>导入历史</h2><p>展示当前文件导入队列中状态不是“待导入”的数据。</p></div>
        </header>
        {historyFiles.length ? (
          <div className="table-wrap history-table-wrap">
            <table className="data-table">
              <thead><tr><th>学校文件</th><th>状态</th><th>操作时间</th><th>进度</th><th>导入结果</th><th>说明</th></tr></thead>
              <tbody>
                {historyFiles.map((row) => (
                  <tr key={row.id}>
                    <td><FileCell row={row} /></td>
                    <td><StatusPill status={row.status} /></td>
                    <td>{row.operationTime}</td>
                    <td><ProgressBar value={row.progress} status={row.status} /></td>
                    <td><span>{formatNumber(row.successRows)} 成功</span><span className="muted"> / </span><span className={row.issueCount ? 'issue-count' : 'muted'}>{row.issueCount} 问题</span></td>
                    <td className="message-cell" title={row.message}>{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-note">暂无导入历史。文件完成导入后会出现在这里。</div>}
      </article>
    </div>
  );
}

function FileCell({ row }) {
  return <div className="file-cell"><strong>{row.fileName}</strong><span>{row.school} · {formatNumber(row.rowCount)} 行 · {row.uploadedAt}</span></div>;
}

function StatusPill({ status }) {
  return <span className={`status-pill ${statusClass(status)}`}><i></i>{displayStatus(status)}</span>;
}

function ProgressBar({ value, status }) {
  return <div className="progress" aria-label={`进度 ${value}%`}><span className={progressClass(status)} style={{ width: `${value}%` }}></span><b>{value}%</b></div>;
}

function Toast({ toast }) {
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
