package com.na.manager.mail;

import java.io.File;
import java.util.Date;
import java.util.List;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;
import javax.mail.Address;
import javax.mail.Message;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import com.na.monitor.core.NodeData;

/**
* @author Andy
* @version 创建时间：2017年9月6日 下午6:27:32
*/
public class SimpleMail {

    // 以文本格式发送邮件  
    public static boolean sendTextMail(MailInfo mailInfo) {       
        //判断是否需要身份认证  
        MyAuthenticator authenticator = null;  
        Properties properties = mailInfo.getProperties();  
        if (mailInfo.isValidate()) {  
            //如果需要身份认证，则创建一个密码验证器  
            authenticator = new MyAuthenticator(mailInfo.getUsername(), mailInfo.getPassword());  
        }  
          
        //根据邮件会话属性和密码验证器构造一个发送邮件的session  
        Session sendMailSession = Session.getDefaultInstance(properties, authenticator);  
        try {  
            Message mailMessage = new MimeMessage(sendMailSession);//根据session创建一个邮件消息   
            Address from = new InternetAddress(mailInfo.getFromAddress());//创建邮件发送者地址  
            mailMessage.setFrom(from);//设置邮件消息的发送者  
            Address to = new InternetAddress(mailInfo.getToAddress());//创建邮件的接收者地址  
            mailMessage.setRecipient(Message.RecipientType.TO, to);//设置邮件消息的接收者  
            mailMessage.setSubject(mailInfo.getSubject());//设置邮件消息的主题  
            mailMessage.setSentDate(new Date());//设置邮件消息发送的时间  
            //mailMessage.setText(mailInfo.getContent());//设置邮件消息的主要内容  
              
            //MimeMultipart类是一个容器类，包含MimeBodyPart类型的对象  
            Multipart mainPart = new MimeMultipart();  
            MimeBodyPart messageBodyPart = new MimeBodyPart();//创建一个包含附件内容的MimeBodyPart  
            //设置HTML内容  
            messageBodyPart.setContent(mailInfo.getContent(),"text/html; charset=utf-8");  
            mainPart.addBodyPart(messageBodyPart);  
  
            //存在附件  
            String[] filePaths = mailInfo.getAttachFileNames();  
            if (filePaths != null && filePaths.length > 0) {  
                for(String filePath:filePaths){  
                    messageBodyPart = new MimeBodyPart();  
                    File file = new File(filePath);   
                    if(file.exists()){//附件存在磁盘中  
                        FileDataSource fds = new FileDataSource(file);//得到数据源  
                        messageBodyPart.setDataHandler(new DataHandler(fds));//得到附件本身并至入BodyPart  
                        messageBodyPart.setFileName(file.getName());//得到文件名同样至入BodyPart  
                        mainPart.addBodyPart(messageBodyPart);  
                    }  
                }  
            }  
              
            //将MimeMultipart对象设置为邮件内容     
            mailMessage.setContent(mainPart);  
            Transport.send(mailMessage);//发送邮件  
            return true;  
        } catch (Exception e) {  
            e.printStackTrace();    
        }  
        return false;  
    }     
      
    // 以HTML格式发送邮件   
    public static boolean sendHtmlMail(MailInfo mailInfo) {       
        //判断是否需要身份认证  
        MyAuthenticator authenticator = null;  
        Properties properties = mailInfo.getProperties();  
        if (mailInfo.isValidate()) {  
            // 如果需要身份认证，则创建一个密码验证器  
            authenticator = new MyAuthenticator(mailInfo.getUsername(), mailInfo.getPassword());  
        }  
  
        // 根据邮件会话属性和密码验证器构造一个发送邮件的session  
        Session sendMailSession = Session.getDefaultInstance(properties, authenticator);  
        try{  
            Message mailMessage = new MimeMessage(sendMailSession);//根据session创建一个邮件消息   
            Address from = new InternetAddress(mailInfo.getFromAddress());//创建邮件发送者地址  
            mailMessage.setFrom(from);//设置邮件消息的发送者  
            Address to = new InternetAddress(mailInfo.getToAddress());//创建邮件的接收者地址  
            mailMessage.setRecipient(Message.RecipientType.TO, to);//设置邮件消息的接收者  
            mailMessage.setSubject(mailInfo.getSubject());//设置邮件消息的主题  
            mailMessage.setSentDate(new Date());//设置邮件消息发送的时间  
              
            //MimeMultipart类是一个容器类，包含MimeBodyPart类型的对象  
            Multipart mainPart = new MimeMultipart();  
            MimeBodyPart messageBodyPart = new MimeBodyPart();//创建一个包含HTML内容的MimeBodyPart  
            //设置HTML内容  
            messageBodyPart.setContent(mailInfo.getContent(),"text/html; charset=utf-8");  
            mainPart.addBodyPart(messageBodyPart);  
              
            //存在附件  
            String[] filePaths = mailInfo.getAttachFileNames();  
            if (filePaths != null && filePaths.length > 0) {  
                for(String filePath:filePaths){  
                    messageBodyPart = new MimeBodyPart();  
                    File file = new File(filePath);   
                    if(file.exists()){//附件存在磁盘中  
                        FileDataSource fds = new FileDataSource(file);//得到数据源  
                        messageBodyPart.setDataHandler(new DataHandler(fds));//得到附件本身并至入BodyPart  
                        messageBodyPart.setFileName(file.getName());//得到文件名同样至入BodyPart  
                        mainPart.addBodyPart(messageBodyPart);  
                    }  
                }  
            }  
              
            //将MimeMultipart对象设置为邮件内容     
            mailMessage.setContent(mainPart);  
            Transport.send(mailMessage);//发送邮件  
            return true;  
        }catch (Exception e) {  
            e.printStackTrace();  
        }  
        return false;  
    }
    
    public static String buildHtml(List<NodeData> list){
    	StringBuilder content = new StringBuilder();
    	content.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">")  
         .append("<html>")  
         .append("<head>")  
         .append("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">")  
         .append("<title>最新服务器列表</title>")  
         .append("<style type=\"text/css\">")  
         .append(".test{font-family:\"Microsoft Yahei\";font-size: 14px;}")
         .append("table{border-right:1px solid #999;border-bottom:1px solid #999}")
         .append("table td{border-left:1px solid #999;border-top:1px solid #999} ")
         .append("</style>")  
         .append("</head>")  
         .append("<body>") ;
    	content.append("<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody style=\"text-align:center;\">");
    	content.append("<tr><td width=\"120px;\">项目描述</td><td width=\"120px;\">项目名称</td><td width=\"150px;\">服务器IP</td></tr></tbody>");
    	list.forEach(item -> {
			content.append("<tr><td>").append(item.getDisplayName()).append("</td><td>")
						.append(item.getApplicationName()).append("</td><td>").append(item.getServerAddress())
						.append("</td></tr>");
		});
    	content.append("</table>");
		content.append("</body>");
		content.append("</html>"); 
		return content.toString();
    }
}
