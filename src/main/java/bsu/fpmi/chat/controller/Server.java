package bsu.fpmi.chat.controller;

import bsu.fpmi.chat.model.Message;
import bsu.fpmi.chat.util.MessageUtil;
import bsu.fpmi.chat.util.ServletUtil;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/WebChatApplication")
public class Server extends HttpServlet{

    @Override
    protected void doPost(HttpServletRequest httpServletRequest, HttpServletResponse response) throws ServletException, IOException {
        String data = ServletUtil.getMessageBody(httpServletRequest);
        try {
            JSONObject json = MessageUtil.fromStringToJSON(data);
            Message msg = MessageUtil.fromJsonToMessage(json);
            System.out.println(msg.getDate() + ' ' + msg.getUser() + " : " + msg.getMessage());
            response.setStatus(HttpServletResponse.SC_OK);
        }
        catch (ParseException e){
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
