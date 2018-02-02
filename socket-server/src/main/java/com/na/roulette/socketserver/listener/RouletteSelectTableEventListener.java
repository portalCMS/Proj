package com.na.roulette.socketserver.listener;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;
import com.na.roulette.socketserver.cache.RouletteCache;
import com.na.roulette.socketserver.entity.RouletteGameTable;
import com.na.user.socketserver.command.sendpara.SelectTableResponse;
import com.na.user.socketserver.common.event.SelectTableEvent;

/**
 * 选择桌台事件监听器
 * 
 * @author alan
 * @date 2017年7月11日 上午10:59:22
 */
@Component
public class RouletteSelectTableEventListener implements ApplicationListener<SelectTableEvent> {
	
	private final static Logger log = LoggerFactory.getLogger(RouletteSelectTableEventListener.class);
	
	@Autowired
	private SocketIOServer socketIOServer;

	@Override
	public void onApplicationEvent(SelectTableEvent event) {
		log.debug("【轮盘-快速换桌】:事件触发");
		SelectTableResponse selectTableResponse = event.getSource();
		
		Map<Integer,RouletteGameTable> gameTableMap = RouletteCache.getGameTableMap();
        gameTableMap.forEach((id,gameTable)->{
//            if(selectTableCommand!=null && selectTableCommand.getGameTableIds()!=null && selectTableCommand.getGameTableIds().size()>0){
//                if(selectTableCommand.getGameTableIds().contains(gameTable.getGameTablePO().getId())){
//                    selectTableResponse.addGameTable(gameTable);
//                }
//            }else {
                selectTableResponse.addGameTable(gameTable);
//            }
        });
	}
	
	

}
