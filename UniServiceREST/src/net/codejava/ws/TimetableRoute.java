package net.codejava.ws;

import java.sql.Connection;

import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import javax.ws.rs.GET;

import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
 
@Path("/getTimetable")
public class TimetableRoute {
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String Read() throws ClassNotFoundException, SQLException {
    	Class.forName("org.sqlite.JDBC");
		Connection con=DriverManager.getConnection("jdbc:sqlite:/home/andreadiubaldo/eclipse-workspaceWeb/UniServiceREST/uniService.db");
		
		Statement st=con.createStatement();
		
		//reading records
		System.out.println("Reading records:");

		ResultSet rs=st.executeQuery("select * from timetable");
		
		return stringa(rs);
    }
    
    private String stringa (ResultSet rs) throws SQLException {
    	ArrayList<String> a = new ArrayList<>();
		
		while(rs.next()){
			a.add("{\"year \": \"" +  rs.getString("anno") + "\""   
					 + ",\"day\": \""  + rs.getString("giorno") +"\"" 
					 + ",\"exam\": \"" +  rs.getString("materia") + "\"" 
					 + ",\"start\":" + rs.getString("inizioLezioni") 
					 + ",\"finish\":" + rs.getString("fineLezioni") + "}"); 
		}
		return a.toString();
    	

    	
    }
}







