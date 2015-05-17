package bsu.fpmi.chat.controller;

import static bsu.fpmi.chat.util.MessageUtil.*;
import static bsu.fpmi.chat.util.ServletUtil.getMessageBody;

import bsu.fpmi.chat.model.Message;
import bsu.fpmi.chat.storage.xml.StoreIntoXML;
import bsu.fpmi.chat.util.ServletUtil;

import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.apache.log4j.Logger;
import org.xml.sax.SAXException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.xpath.XPathExpressionException;

import java.io.IOException;
import java.io.PrintWriter;


@WebServlet("/WebChatApplication")
public class Server extends HttpServlet{

    private static Logger logger = Logger.getLogger(Server.class.getName());

    @Override
    public void init() throws ServletException {
        try {
            loadHistory();
        }
        catch (ParserConfigurationException e) {
            logger.error(e);
        }
        catch (SAXException e) {
            logger.error(e);
        }
        catch (TransformerException e) {
            logger.error(e);
        }
        catch (IOException e) {
            logger.error(e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        logger.info("doGet");
        String token = request.getParameter(TOKEN);
        logger.info("Token " + token);
        try {
            if (token != null && !"".equals(token)) {
                int index = getIndex(token);
                logger.info("Index " + index);
                String tasks;
                tasks = formResponse(index);
                response.setCharacterEncoding(ServletUtil.UTF_8);
                response.setContentType(ServletUtil.APPLICATION_JSON);
                PrintWriter out = response.getWriter();
                out.print(tasks);
                out.flush();
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "'token' parameter needed");
            }
        } catch (SAXException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (ParserConfigurationException e){
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
     protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        logger.info("doPost");
        String data = getMessageBody(request);
        logger.info(data);
        try {
            JSONObject json = fromStringToJSON(data);
            Message msg = fromJsonToNewMessage(json);
            System.out.println(msg.getDate() + ' ' + msg.getUser() + " : " + msg.getMessageText());
            StoreIntoXML.addData(msg);
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (ParseException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (ParserConfigurationException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (SAXException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (TransformerException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        logger.info("Delete request");
        String data = getMessageBody(request);
        logger.info("Request data : " + data);
        Message message;
        try {
            JSONObject jsonObject = fromStringToJSON(data);
            message = fromJsonToMessage(jsonObject);
            message.delete();
            StoreIntoXML.updateData(message);
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (ParseException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (ParserConfigurationException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (SAXException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (TransformerException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
        catch (XPathExpressionException e) {
            logger.error(e);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @SuppressWarnings("unchecked")
    private String formResponse(int index) throws SAXException, IOException, ParserConfigurationException {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put(MESSAGES, StoreIntoXML.getSubMessagesByIndex(index));
        jsonObject.put(TOKEN, getToken(StoreIntoXML.getStorageSize()));
        return jsonObject.toJSONString();
    }

    private void loadHistory() throws SAXException, IOException, ParserConfigurationException, TransformerException {
        if (!StoreIntoXML.doesStorageExist()) {
            StoreIntoXML.createStorage();
            addStubData();
        }
    }

    private void addStubData() throws ParserConfigurationException, TransformerException {
        Message msg = new Message("System", "Welcome to our chat!");
        try {
            StoreIntoXML.addData(msg);
        }
        catch (ParserConfigurationException e) {
            logger.error(e);
        }
        catch (SAXException e) {
            logger.error(e);
        }
        catch (TransformerException e) {
            logger.error(e);
        }
        catch (IOException e) {
            logger.error(e);
        }
    }
}
