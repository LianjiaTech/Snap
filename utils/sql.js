module.exports = {
  CREATE_SNAPSHOT_LOG: 'INSERT INTO snapshot_log(source, snap_id, snap_req, snap_res) VALUES (?, ?, ?, ?)',
  QUERY_SNAPSHOT_LOG: 'SELECT * FROM snapshot_log WHERE snap_id = ?',
  COUNT_SNAPSHOT_LOG: 'SELECT COUNT(*) AS total_num FROM snapshot_log',
  COUNT_TIME_QUANTUM_SNAPSHOT_LOG: 'SELECT COUNT(*) AS total_num FROM snapshot_log WHERE add_time >= ? AND add_time < ?',
};
