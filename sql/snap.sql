CREATE TABLE `snapshot_log`(
    `id` INT(11) NOT NULL auto_increment,
    `source` VARCHAR(8) NOT NULL DEFAULT '' COMMENT '截图来源',
    `snap_id` VARCHAR(22) NOT NULL DEFAULT '' COMMENT '截图唯一标识',
    `snap_req` TEXT COMMENT '截图请求',
    `snap_res` TEXT COMMENT '截图返回',
    `state` TINYINT(2) NOT NULL DEFAULT 1 COMMENT '状态 1 有效 0 删除',
    `add_by` VARCHAR(25) NOT NULL DEFAULT '' COMMENT '创建人',
    `mod_by` VARCHAR(25) NOT NULL DEFAULT '' COMMENT '修改人',
    `add_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `mod_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE unq_snap_id(`snap_id`)
) ENGINE=INNODB AUTO_INCREMENT=1 DEFAULT CHARSET='utf8mb4' COLLATE='utf8mb4_unicode_ci' COMMENT='截图日志';