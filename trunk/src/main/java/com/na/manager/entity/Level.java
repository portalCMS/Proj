package com.na.manager.entity;

import java.io.Serializable;

/**
 * @author java
 * @time 2015-07-21 18:05:58
 */
public class Level implements Serializable{
	private static final long serialVersionUID = 1L;
	/**
	 * 用户等级ID
	 */
	private Integer lid;
	/**
	 * 级别
	 */
	private String levelName;

	public Integer getLid() {
		return lid;
	}

	public void setLid(Integer lid) {
		this.lid = lid;
	}

	public String getLevelName() {
		return levelName;
	}

	public void setLevelName(String levelName) {
		this.levelName = levelName;
	}
}